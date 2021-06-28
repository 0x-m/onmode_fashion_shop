from django.http.response import FileResponse, HttpResponse, HttpResponseBadRequest, HttpResponseForbidden
from .models import Appeal, Product, Shop
from django import http
from django.http.request import HttpRequest
from django.shortcuts import render, resolve_url
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_list_or_404, get_object_or_404

@login_required
def make_appeal(request:HttpRequest):
    if request.method == 'POST':
        appeal = request.user.appeal
        if appeal:
            return render(request,'shop/appeal',{
                'appeal': appeal
            })
        
        page_name = request.POST.get('page_name')
        description = request.POST.get('description')
        
        if not page_name:
            return HttpResponseBadRequest()
        shop =  Shop.objects.filter(name=page_name).exists()
        if shop:
            return HttpResponseBadRequest("the boutique with name %s is already exists" % page_name)
        appeal = Appeal(user=request.user, name=page_name)
        appeal.save()
        return HttpResponse("an appeal is registered")


@login_required
def check_for_shop_name(request:HttpRequest, shop_name):
    res = Shop.objects.filter(name=shop_name).exists()
    
    if res:
        return HttpResponseForbidden()
    return HttpResponse("it's ok!")

@login_required
def add_edit_product(request:HttpRequest,product_id=None):
    pass

@login_required
def remove_product(reqest:HttpRequest, product_id):
    product = Product.objects.filter(id=product_id).first()
    if product:
        if product.shop.seller == reqest.user:
            product.is_active = False
            product.save()
            return HttpResponse("the product was successfully removed.")
        else:
            return HttpResponseForbidden("you dont have permission to remove this product")
    else:
        return HttpResponseBadRequest("product was not found!")
    
    

def get_products_of_shop(reqest:HttpRequest, shop_name):
    
    products = get_list_or_404(Product,shop__name=shop_name)
    
    return render(reqest, 'product/product_list.html', {
        'products': products
    })
        

def product_list(request:HttpRequest, shop_name):
    pass

def product_detail(request:HttpRequest, product_id):
    product = get_object_or_404(Product,id=product_id)
    return render(request, 'product/product/detail.html',{
        'product':product
    })
    

def get_all_products(request:HttpRequest):
    pass

def filter(request:HttpRequest, shop_name=None):
    pass


def search(request:HttpRequest, keywords):
    pass


def detail(request:HttpRequest):
    return render(request, 'shop/orders.html')