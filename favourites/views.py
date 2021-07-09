from django.http.response import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.http import HttpRequest
from django.contrib.auth.decorators import login_required
from shops.models import Product
from .models import Favourite
from cart.cart import Cart

@login_required
def add(request:HttpRequest,product_id):
    product = Product.objects.filter(id=product_id).first()
    if not product:
        return HttpResponseBadRequest("prouct does not exist")
    user = request.user
    Favourite.objects.get_or_create(user=user,product=product);
    print("addding....")
    return HttpResponse("product was successfully added to favourites")
    
@login_required
def remove(request:HttpRequest,product_id):
    favourite = Favourite.objects.filter(user=request.user, product__id=product_id)
    if not favourite:
        return HttpResponseBadRequest("product does not exist")
    
    favourite.delete()
    return HttpResponse("product was successfully removed from favourites")

@login_required
def favourites(request:HttpRequest):
    favourites = request.user.favourites.all()
    cart_list = Cart(request).cart.keys()
    cart_list = list(cart_list)
    return render(request, 'favourites/favourites.html',{
        'favourites': favourites,
        'cart': [int(i) for i in cart_list]
    })


