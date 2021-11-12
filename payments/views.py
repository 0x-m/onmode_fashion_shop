from django.contrib.auth.decorators import login_required
from django.core.files.base import equals_lf
from django.db.models.query import RawQuerySet
from django.http.request import QueryDict
from django.http.response import HttpResponseBadRequest, HttpResponseNotAllowed, JsonResponse
from django.shortcuts import render
from django.http import HttpResponse, HttpRequest
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.html import conditional_escape, html_safe
import requests
import json
from  users.models import Address
from orders.form import AddressForm
from requests.api import request
from cart.cart import Cart
from orders.models import OrderAddress, OrderList
from payments.models import PaymentTransaction
from decouple import config
from django.conf import UserSettingsHolder, settings
merchant_id = 'c7605487-63a0-472d-b296-88ef6466bd89'
@login_required
def pay(request: HttpRequest):
    type = request.GET.get('type') # deposit | checkout
    amount = request.GET.get('amount')
    phone_no = request.user.phone_no
    request.session['pay_amount'] = amount
    if type == 'deposit':
        request.session['payment_type'] = 'deposit'
        callback_url = reverse('payments:verify')
        description = 'واریز به حساب'
    elif type == 'checkout':
        if len(Cart(request)) == 0:
            return HttpResponse('کارت خالیست')
        request.session['payment_type'] = 'checkout'
        callback_url = reverse('payments:verify')
        description = 'خرید محصول'
    request.session.save()

    params = {
        'merchant_id':merchant_id,
        'amount': amount,
        'callback_url': callback_url,
        'description': description,
        'metadata': {
             'mobile': phone_no
        }
    }
    
    headers = {
        'content-type': 'application/json',
        'accept': 'application/json'
    }

    req = requests.post('https://api.zarinpal.com/pg/v4/payment/request.json/',
                        json= params, 
                        headers=headers)
    res = req.json()
    if res['data']['code'] == 100:  
        return redirect('https://www.zarinpal.com/pg/StartPay/'+ res['data']['authority'])
    else:
        return HttpResponse('error: ' + str(res['status'])) #Design an ERROR PAGE
    


def _verify_checkout(request: HttpRequest):
    user = request.user
    cart = Cart(request)
    order_id  = None
    oa = None

    if request.session.get('order_address'):
        print(request.session.get('order_address'))
        c = QueryDict()
        oa = OrderAddress(**request.session.get('order_address'))
        oa.save();
        del request.session['order_address']
        request.session.save()
    cart.make_orders(user, oa)
    cart.checkout()
    

def _verify_deposit(user, amount):
    p = PaymentTransaction(account=user.account,
                           amount=amount)
    p.apply()
    

def dispatch_pay(request: HttpRequest):
    if request.method == 'GET':
        return HttpResponseNotAllowed('post')
    print('-------------------',request.POST,'-----------------------')
    user = request.user
    amount = request.POST.get('amount')
    print(amount)
    try:
        amount = int(amount)
    except:
        return HttpResponseBadRequest('invalid input...')

    use_default_address = request.POST.get('use_default_address').strip();
    use_default_address = True if (use_default_address == 'true') else False
    ua = Address.objects.filter(user=request.user).first()
    has_address = False

    if ua:
        has_address = ua.is_complete()
            
    if use_default_address and not has_address:
        return HttpResponseBadRequest('complete your address');
    address = None
    if not use_default_address:
        form = AddressForm(request.POST)
        if form.is_valid():
            # address = form.save()
            request.session['order_address'] = form.cleaned_data
            request.session.save() 
        else:
            return HttpResponseBadRequest('invalid inputs....')
    


    if user.account.has_enough_balance(amount):
        _verify_checkout(request)
        return HttpResponse('success')
    else:
        return redirect('/payments/pay/?' + 'type=checkout' + '&amount=' + str(amount) + '/')





def verify(request:HttpRequest):
    type = None
    if request.session.get('payment_type'):
        type = request.GET.get('payment_type') # deposit | checkout
        del request.session['payment_type']
        
    amount = None
    if request.session.get('pay_amount'):
        amount = request.session.get('pay_amount')
        del request.session['pay_amount']
    if not amount or not type:
        return HttpResponseBadRequest()
    
    if request.GET.get('Status') == 'OK':
        authority = request.GET.get('Authority')
        params = {
        'merchant_id':merchant_id,
        'authority': authority,
        'amount': amount,
        }
        headers = {
            'content-type': 'applicatioin/json',
            'accept': 'application/json'
        }
        req = requests.post('https://api.zarinpal.com/pg/v4/payment/verify.json', 
                            headers=headers, params=params)
        res = json.load(req.json())
        if res['data']['code'] == 100:
            if type == 'checkout':
                _verify_checkout(request)   
            elif type == 'deposit':
                _verify_deposit(request.user, amount)
            else:
                return HttpResponseBadRequest()
                                    
            #log payment---------------
            ref_id = res['data']['ref_id']
            
            p = PaymentTransaction(user=request.user ,
                                   type=type, 
                                   ref_id= ref_id, 
                                   description='none', 
                                   authority= authority)
            p.save()               
            return HttpRequest("transaction sucess.\n refid: " + str(res['ref_id'])) #NEED DESIGN
        elif res['code'] == 101:
            return HttpResponse("transaction submitted\n status:" + str(res['status']))
        else:
            return HttpResponse("transaction falied code:" + str(res['code']))
    else:
        return HttpResponse("transcation faild or canceled by user")


