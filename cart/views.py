from coupons.models import Coupon
from django.db.models.query import RawQuerySet
from django.http.response import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.shortcuts import render
from django.http import HttpRequest
from django.contrib.auth.decorators import login_required
from shops.models import Category, Product
import string
from .cart import Cart


@login_required
def add(request:HttpRequest, product_id):
    product = Product.objects.filter(id=product_id).first()
    qunatity = request.GET.get('q')
    if not product:
        return HttpResponseBadRequest("product is not found")
    if qunatity:
        try:
            qunatity = int(qunatity)
        except:
            qunatity = 1
        
    cart = Cart(request)
    cart.add(product.id,qunatity)
    return HttpResponse("product was added to the cart")



@login_required
def remove(request:HttpRequest, product_id):
    cart = Cart(request)
    
    if cart.remove(product_id):
        res = {'total': cart.get_total_price()}
        return JsonResponse(res)
    return HttpResponseBadRequest("invalid product")

@login_required
def increment(request:HttpRequest, product_id):
    cart = Cart(request)
    if cart.increment(product_id):
        res = {'total': cart.get_total_price()}
        return JsonResponse(res)
    return HttpResponseBadRequest("invalid product")

@login_required
def decrement(request:HttpRequest, product_id):
    cart = Cart(request)
    if cart.decrement(product_id):
        res = {
            'total': cart.get_total_price()
        }
        return JsonResponse(res)

    return HttpResponseBadRequest("invalid product")


@login_required
def apply_coupon(request:HttpRequest, code):
    coupon = Coupon.objects.filter(code=code).first()
    if not coupon:
        return HttpResponseBadRequest("invalid coupon")
    cart = Cart(request)
    cart.apply_coupon(coupon)
    res = {
        'total': cart.get_total_price()
    }
    return JsonResponse(res)

@login_required
def checkout(request:HttpRequest):
    pass

@login_required
def cart_list(request:HttpRequest):
    cart = Cart(request)
    return render(request, 'cart/cart.html', {
        'cart':cart
    })
