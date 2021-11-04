from django.db.models.query import RawQuerySet
from requests.models import RequestEncodingMixin
from coupons.models import Coupon
from .form import AddressForm
from os import RTLD_DEEPBIND, stat, stat_result
import requests
import json
from django.http.response import Http404, HttpResponse, HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNotAllowed, HttpResponseNotFound
from .models import OrderList
from django.shortcuts import redirect, render
from django.http import HttpRequest
from django.contrib.auth.decorators import login_required, user_passes_test
from cart.cart import Cart
from .models import Order,OrderItem,OrderList, OrderAddress
import logging
from product_attributes.models import Size,Color

#----------------------- LOGGING CONFIG----------------------
logger = logging.Logger(__name__, logging.DEBUG)
f_handler = logging.FileHandler('order.log','w')
formatter = logging.Formatter("%(name)s - %(levelname)s %(message)s")
f_handler.setFormatter(formatter)
logger.addHandler(f_handler)
#---------------------------------------------------------



@login_required
def checkout_cart(request:HttpRequest):
    return render(request,'orders/address.html',{
        'form': AddressForm()
    })
        

@login_required        
def get_shop_orders(request:HttpRequest):
    status = request.GET.get('status', 'pending')
    order_states = [Order.PENDING, Order.ACCEPTED, Order.REJECTED, Order.RECEIVED, Order.SENT, Order.RETURNED,'all']
    order_states = [o.lower() for o in order_states]
    print(status.lower() in order_states)
    if not (status.lower() in [o.lower() for o in order_states]):
        return HttpResponseNotFound('not found')
    
    if not request.user.shop.first():
        return HttpResponseBadRequest("shop not found")
    orders = Order.objects.filter(shop=request.user.shop.first(), state=status)
    return render(request, 'orders/all_orders.html', {
        'orders': orders,
        'owner': 'shop'
    })
    
    
@login_required    
def get_user_orders(request:HttpRequest):
    status = request.GET.get('status')
    if not status:
        status = 'pending'
    order_states = [Order.PENDING, Order.ACCEPTED, Order.REJECTED, Order.RECEIVED, Order.SENT, Order.RETURNED,'all']
    order_states = [o.lower() for o in order_states]
    if not (status.lower() in [o.lower() for o in order_states]):
        return HttpResponseNotFound('not found')
    orders = Order.objects.all()
    print(len(orders), 'numbers....')
    if (status != 'all'):
        print('not all')
        orders = Order.objects.filter(user=request.user, state=status)
 
    return render(request, 'orders/all_orders.html', {
        'orders': orders,
        'owner': 'user'
    })
    
        

@login_required
def accept_order(request:HttpRequest, order_id):
    order = Order.objects.filter(id=order_id).first()
    if not order:
        return HttpResponseBadRequest('order not found...')
    if not order.shop == request.user.shop.first():
        return HttpResponseForbidden('you are not allowed...')
    
    if order.state == Order.PENDING:
        order.accept()
    return redirect('/orders/shop/' + order_id + '/')

@login_required
def reject_order(request:HttpRequest,order_id):
    order = Order.objects.filter(id=order_id).first()
    if not order:
        return HttpResponseBadRequest('order not found...')
    if not order.shop == request.user.shop.first():
        return HttpResponseForbidden('you are not allowed...')
    
    if order.state == Order.PENDING:
        order.reject()
    return redirect('/orders/shop/' + order_id + '/')


@login_required
def cancell_order(request:HttpRequest, order_id):
    order = Order.objects.filter(id=order_id).first()
    if not order:
        return HttpResponseBadRequest('order not found...')
    if not order.order_list.user == request.user:
        return HttpResponseForbidden('you are not allowed...')
    
    if order.state == Order.PENDING:
        order.cancell()
    return redirect('/orders/shop/' + order_id + '/')


@login_required
def register_tracking_code(request:HttpRequest, order_id):
    order = Order.objects.filter(id=order_id).first()
    if not order:
        return HttpResponseBadRequest('order not found...')
    if not order.shop == request.user.shop.first():
        return HttpResponseForbidden('you are not allowed...')
    
    tracking_code = request.GET.get('tracking_code')
    
    if not tracking_code:
        return HttpResponseBadRequest('invalid tracking code...')
    
    if order.state == Order.ACCEPTED:
        order.tracking_code = tracking_code
        order.save();
    return redirect('/orders/shop/' + order_id + '/')


@login_required
def verify_recieve_order(request:HttpRequest,order_id):
    order = Order.objects.filter(id=order_id).first()
    if not order:
        return HttpResponseBadRequest('order not found...')
    if not order.order_list.user == request.user:
        return HttpResponseForbidden('you are not allowed...')
    
    if order.state == Order.SENT:
        order.recieve();
    return redirect('/orders/shop/' + order_id + '/')


        
    



@login_required
def get_user_order_detail(request:HttpRequest, order_id):
    order = Order.objects.filter(id=order_id).first();
    if not order:
        return HttpResponseBadRequest('Invalid order id....')
    return render(request,'orders/order.html',{
        'order': order,
        'owner': 'user'
    })
    
@login_required
def get_shop_order_detail(request:HttpRequest, order_id):
    print('shop order detial....')
    order = Order.objects.filter(id=order_id).first();
    if not order:
        return HttpResponseBadRequest('Invalid order id....')
    return render(request,'orders/order.html',{
        'order': order,
        'owner': 'shop',
    })

