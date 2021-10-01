from django.db.models.query import RawQuerySet
from coupons.models import Coupon
from .form import AddressForm
from os import RTLD_DEEPBIND, stat, stat_result

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
def get_shop_orders(request:HttpRequest, status='pending'):
    order_states = [Order.PENDING, Order.ACCEPTED, Order.REJECTED, Order.RECEIVED, Order.SENT, Order.RETURNED]
    if not (status.lower() in [o.lower for o in order_states]):
        return HttpResponseNotFound('not found')
    
    if not request.user.shop.first():
        return HttpResponseBadRequest("shop not found")
    orders = Order.objects.filter(shop=request.user.shop.first(), status=status)
    # pending_orders = orders.filter(state=Order.PENDING)
    # accepted_orders = orders.filter(state=Order.ACCEPTED)
    # sent_orders = orders.filter(state=Order.SENT)
    # returned_orders = orders.filter(state=Order.RETURNED)
    # recieved_orders = orders.filter(state=Order.RECEIVED)
    # rejected_orders = orders.filter(state=Order.REJECTED)

    
    # return render(request, 'orders/orders.html',{
    #     'pending_orders': pending_orders,
    #     'accepted_orders': accepted_orders,
    #     'sent_orders': sent_orders,
    #     'recieved_orders': recieved_orders,
    #     'returned_orders': returned_orders,
    #     'rejected_orders': rejected_orders,
    #     'owner': 'shop'
        
    # })
    
    return render(request, 'all_orders.html', {
        'orders': orders
    })
    
    
@login_required    
def get_user_orders(request:HttpRequest, status: str ='pending'):
    print(Order.ACCEPTED)
    order_states = [Order.PENDING, Order.ACCEPTED, Order.REJECTED, Order.RECEIVED, Order.SENT, Order.RETURNED,'all']
    order_states = [o.lower() for o in order_states]
    print(status.lower() in order_states)
    if not (status.lower() in [o.lower() for o in order_states]):
        return HttpResponseNotFound('not found')
    orders = Order.objects.all()
    print(len(orders), 'numbers....')
    if (status != 'all'):
        print('not all')
        orders = Order.objects.filter(user=request.user, state=status)
    
    
    # orders = Order.objects.filter(user=request.user)
    # pending_orders = orders.filter(state=Order.PENDING)
    # accepted_orders = orders.filter(state=Order.ACCEPTED)
    # rejected_orders = orders.filter(state=Order.REJECTED)
    # sent_orders = orders.filter(state=Order.SENT)
    # returned_orders = orders.filter(state=Order.RETURNED)
    # recieved_orders = orders.filter(state=Order.RECEIVED)
    
    # return render(request, 'orders/orders.html',{
    # 'pending_orders': pending_orders,
    # 'accepted_orders': accepted_orders,
    # 'sent_orders': sent_orders,
    # 'recieved_orders': recieved_orders,
    # 'returned_orders': returned_orders,
    # 'rejected_orders': rejected_orders,
    # 'owner': 'user',
    
    # })
    return render(request, 'orders/all_orders.html', {
        'orders': orders
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

