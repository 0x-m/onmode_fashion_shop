from os import stat

from django.http.response import HttpResponse, HttpResponseBadRequest
from .models import OrderList
from django.shortcuts import render
from django.http import HttpRequest
from django.contrib.auth.decorators import login_required
from cart.cart import Cart
from .models import Order,OrderItem,OrderList, OrderAddress
import logging


#----------------------- LOGGING CONFIG----------------------
logger = logging.Logger(__name__, logging.DEBUG)
f_handler = logging.FileHandler('order.log','w')
formatter = logging.Formatter("%(name)s - %(levelname)s %(message)s")
f_handler.setFormatter(formatter)
logger.addHandler(f_handler)
#---------------------------------------------------------

@login_required
def checkout(request:HttpRequest):
    logger.info('checkout issued...')
    cart = Cart(request)
    if request.method == "POST":
        #cashing cart--------------
        orders = {}
        order_list = OrderList(user=request.user)
        order_list.save()
        
        for item in cart: 
            product = item['product']
            shop = product.shop
            size = 0
            color = 0
            if item['size']:
                size = int(item['size'])
            if item['color']:
                color = int(item['color'])
       
            quantity = item['quantity']
            
            if shop.id not in orders.keys():
                orders[shop.id] = Order(user=request.user,shop=shop,order_list=order_list)
                orders[shop.id].save()
                
            order_item  = OrderItem(
                order=orders[shop.id],
                product=product,
                quantity=quantity,
                size = size,
                color = color
            )
            
            order_item.save()
            orders[shop.id].save() #to compute price
            
        order_list.save() #to compute price
        
        request.cart.clear()
        del request.session['coupon_id']
        return render(request ,'orders/address.html',{
            'order_list_id': order_list.id
        })
    
    return render(request,'checkout.html',{
    'total_price': cart.get_total_price() })


@login_required
def get_user_orders(request:HttpRequest, state):
    if request.method == "POST":
        orders = Order.objects.filter(user=request.user, state=state)
        return render(request, 'orders/order.html',{
            'orders': orders,
            'state': state
        })
        
def get_shop_orders(request:HttpRequest, state):
    if request.method == "POST":
        if not request.uer.shop:
            return HttpResponseBadRequest("shop not found")
        orders = Order.objects.filter(shop=request.user.shop, state=state)
        return render(request, 'shop/orders.html',{
            'orders':orders,
            'state': state
        })
        
        
def orders(request:HttpRequest):
    return render(request, 'orders/orders.html');