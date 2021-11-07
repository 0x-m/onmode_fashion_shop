
from product_attributes.models import Color, Size
from coupons.models import Coupon
from django.http.response import HttpResponse, HttpResponseBadRequest, HttpResponseForbidden, JsonResponse
from django.shortcuts import render
from django.http import HttpRequest
from django.contrib.auth.decorators import login_required
from shops.models import Category, Product
from users.models import Address
import string
from .cart import Cart
from index.utils import get_provinces


@login_required
def add(request:HttpRequest, product_id):
    print(request.session)
    product = Product.objects.filter(id=product_id).first()
    qunatity = request.GET.get('q',1)
    color = request.GET.get('color')
    size = request.GET.get('size')
    if not product:
        return HttpResponseBadRequest("product is not found")
    if request.user.is_authenticated:
        if product.shop == request.user.shop.first():
            return HttpResponseForbidden("you can not buy from yourself...!")
    if qunatity:
        try:
            qunatity = int(qunatity)
        except:
            qunatity = 1
   
    cart = Cart(request)
    cart.add(product.id, qunatity)
    if size and color:
        try:
            color = int(color)
            color = Color.objects.get(id=color)
            size = int(size)
            size = Size.objects.get(id=size)
            cart.choose_color(product_id=product.id,color=color.code,color_id=color.id)
            cart.choose_size(product.id, size.code, size.id)
        except:
            return HttpResponseBadRequest("size or color does not defiend")
    else:
        color = Color.objects.first()
        size = Size.objects.first()
        cart.choose_color(product_id=product.id,color=color.code,color_id=color.id)
        cart.choose_size(product.id, size.code, size.id)
        
    return JsonResponse({'cart_num': len(cart)})


@login_required
def checkout_cart(request: HttpRequest):
    pass

@login_required
def remove(request:HttpRequest, product_id):
    print('-----------------------------------------------------')
    cart = Cart(request)
    r = cart.remove(product_id)
    if r:
        res = {
            'total': cart.get_total_price(),
            'num': len(cart)
        }
        return JsonResponse(res)
    return HttpResponseBadRequest("invalid product")

@login_required
def increment(request:HttpRequest, product_id):
    cart = Cart(request)
    if cart.increment(product_id):
        res = {'total': cart.get_total_price(), 'num': len(cart)}
        return JsonResponse(res)
    return HttpResponseBadRequest("invalid request")

@login_required
def decrement(request:HttpRequest, product_id):
    cart = Cart(request)
    if cart.decrement(product_id):
        res = {
            'total': cart.get_total_price(),
            'num': len(cart)
        }
        return JsonResponse(res)

    return HttpResponseBadRequest("invalid request")


@login_required
def clear_cart(request:HttpRequest):
    cart = Cart(request)
    cart.clear()
    return HttpResponse("cart cleared successfully...")

@login_required
def apply_coupon(request:HttpRequest, code):
    coupon = Coupon.objects.filter(code=code).first()
    if not coupon:
        return HttpResponseBadRequest("invalid coupon")
    if coupon.is_valid():
        cart = Cart(request)
        cart.apply_coupon(coupon)
        res = {
            'total': cart.get_total_price()
        }
        return JsonResponse(res)
    return HttpResponseBadRequest("expired coupon")

@login_required
def checkout(request:HttpRequest):
    return render(request, 'cart/checkout.html', {
        'provinces': get_provinces(),
        });

def cart_list(request:HttpRequest):
    return render(request, 'cart/cart.html',{
        'cart': Cart(request)
    })



@login_required
def dispatcher(request: HttpRequest):
    c = Cart(request)
    uda = request.GET.get('use_default_address')
    has_address = False
    ua = Address.objects.filter(user=request.user).first()
    if ua:
        has_address = ua.is_complete()
    print(uda, has_address, '----------------------------')
    adds =  has_address == True and uda == 'true'
    print(adds,'aaaaaaaassasas')
    hs = request.user.account.has_enough_balance(c.get_total_price())
    return render(request, 'cart/dispatcher.html', {
        'has_enough_balance': hs,
        'has_complete_address': str(adds),
    })

@login_required
def change_product_color(request:HttpRequest):
    product_id = request.GET.get('product_id')
    color_id = request.GET.get("color_id")
    print(color_id,product_id)
    if not product_id or not color_id:
        return HttpResponseBadRequest("color or product invalid")
    product = Product.objects.filter(id=product_id).first()
    color = Color.objects.filter(id=color_id).first();
    if  product and color and color.id in product.colors.all().values_list('id',flat=True):
        cart =Cart(request)
        cart.choose_color(product_id, color.code, color.id)
        return HttpResponse("color changed")
    return HttpResponseBadRequest("invalid request...")

    
    

@login_required
def change_product_size(request:HttpRequest):
    product_id = request.GET.get('product_id')
    size_id = request.GET.get("size_id")
    print(size_id, product_id)
    if not product_id or not size_id:
        return HttpResponseBadRequest("invalid size or product")
    product = Product.objects.filter(id=product_id).first()
    size = Size.objects.filter(id=size_id).first()
    if  product and size and size.id in product.sizes.all().values_list('id',flat=True):
        cart =Cart(request)
        cart.choose_size(product_id,size.code, size.id)
        return HttpResponse("color changed")
    return HttpResponseBadRequest("invalid request...")


    