from django.contrib.auth.decorators import login_required
from django.db.models.query import RawQuerySet
from django.http.response import HttpResponseBadRequest, HttpResponseNotAllowed, JsonResponse
from django.shortcuts import render
from django.http import HttpResponse, HttpRequest
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.html import html_safe
import requests
import json
from orders.form import AddressForm
from requests.api import request
from cart.cart import Cart
from orders.models import OrderAddress, OrderList
from payments.models import PaymentTransaction
from decouple import config
from django.conf import settings
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
    cart = request.cart
    order_id  = None
    if request.session.get('order_address_id'):
        order_id = request.session.get('order_addres_id')
        del request.session['order_address_id']
    oa = None
    if  order_id:
        oa = OrderAddress.objects.filter(id=order_id).first()
    if not oa:
        return HttpResponseBadRequest('invalid inputs...')
    cart.make_orders(user, oa)
    cart.checkout()
    

def _verify_deposit(user, amount):
    p = PaymentTransaction(account=user.account,
                           amount=amount)
    p.apply()
    

def dispatch_pay(request: HttpRequest):
    user = request.user
    amount = request.GET.get('amount')
    try:
        amount = int(amount)
    except:
        return HttpResponseBadRequest('invalid input...')

    use_default_address = request.GET.get('use_default_address')
    use_default_address = True if (use_default_address == 'true') else False
    address = None
    if not use_default_address:
        form = AddressForm(request.POST)
        if form.is_valid():
            address = form.save()
            request.session['order_address_id'] = address.id
            request.session.save() 
        else:
            return HttpResponseBadRequest('invalid inputs....')
    


    if user.account.has_enough_balance(amount):
        user.account.widthraw(amount)
        _verify_checkout(request, use_default_address)
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


