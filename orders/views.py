from coupons.models import Coupon
from .form import AddressForm
from os import stat, stat_result

from django.http.response import HttpResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from .models import OrderList
from django.shortcuts import render
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
def checkout(request:HttpRequest):
    logger.info('checkout issued...')
    cart = Cart(request)
    if request.method == "POST":
        #cashing cart--------------
        orders = {}
        order_list = OrderList(user=request.user)
        order_list.save()
        use_default_addrss = request.POST.get('user_default_address')
        if use_default_addrss == 'false':
            form = AddressForm(request.POST)
            if form.is_valid():
                address = form.save()
                order_list.Address = address
            else:
                return HttpResponseBadRequest('Ivalid inputs....')
        elif use_default_addrss == 'true':
            order_list.use_default_address = True
        else:
            return HttpResponseBadRequest('invalid...')
            
        for item in cart: 
            product = item['product']
            shop = product.shop
            size = 0
            color = 0
            if item['size_id']:
                size_id = int(item['size_id'])
                size = Size.objects.filter(id=size_id).first()
            if item['color_id']:
                color_id = int(item['color_id'])
                color = Color.objects.filter(id=color_id).first()
       
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
        if cart.coupon:
            order_list.coupon = Coupon
        cart.clear()
        
        if request.session.get('coupon_id'):
            del request.session['coupon_id']
            
        #pay for order------------
        account = request.user.account
        price = order_list.total_price_after_applying_coupon
        print(price)
        if account.has_enough_balance(price):
            order_list.finish()
            return render(request, 'orders/checkout_result.html',{
                'state': 'success'
            })
        else:
            request.session['order_list_id'] = order_list.id
            return render(request ,'orders/checkout_result.html',{
                'state' : 'low balance',
                'needed_amount': order_list.total_price_after_applying_coupon,
                'balance': account.balance
            })
    
    return render(request,'orders/address.html',{
        'form': AddressForm()
    })


@login_required        
def get_shop_orders(request:HttpRequest):
    if request.method == "POST":
        if not request.uer.shop:
            return HttpResponseBadRequest("shop not found")
        orders = Order.objects.filter(shop=request.user.shop)
        pending_orders = orders.filter(state=Order.PENDING)
        accepted_orders = orders.filter(state=Order.ACCEPTED)
        sent_orders = orders.filter(state=Order.SENT)
        returned_orders = orders.filter(state=Order.RETURNED)
        recieved_orders = orders.filter(state=Order.RECEIVED)
        
        return render(request, 'shop/orders.html',{
            'pending_orders': pending_orders,
            'accepted_orders': accepted_orders,
            'sent_orders': sent_orders,
            'recieved_orders': recieved_orders,
            'returned_orders': returned_orders
            
        })
    
    
@login_required    
def get_user_orders(request:HttpRequest):
    orders = Order.objects.filter(user=request.user)
    pending_orders = orders.filter(state=Order.PENDING)
    accepted_orders = orders.filter(state=Order.ACCEPTED)
    sent_orders = orders.filter(state=Order.SENT)
    returned_orders = orders.filter(state=Order.RETURNED)
    recieved_orders = orders.filter(state=Order.RECEIVED)
    
    return render(request, 'orders/orders.html',{
    'pending_orders': pending_orders,
    'accepted_orders': accepted_orders,
    'sent_orders': sent_orders,
    'recieved_orders': recieved_orders,
    'returned_orders': returned_orders
    
    })
    
        


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
    order = Order.objects.filter(id=order_id).first();
    if not order:
        return HttpResponseBadRequest('Invalid order id....')
    return render(request,'orders/order.html',{
        'order': order,
        'owner': 'shop',
    })

