from django.forms import forms
from django.http.response import FileResponse, HttpResponse, HttpResponseBadRequest, HttpResponseForbidden
from .models import  Product, Shop
from django import http
from django.http.request import HttpRequest
from django.shortcuts import render, resolve_url
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_list_or_404, get_object_or_404
from .models import *
from django.core.paginator import Paginator

from .forms import AddProductForm
# @login_required
# def make_appeal(request:HttpRequest):
#     print('appeal was issued...')
#     appeal = Appeal.objects.filter(user=request.user).first()
#     if request.method == 'POST':
#         if appeal:
#             return render(request,'shop/appeal.html',{
#                 'appeal': appeal
#             })
        
#         page_name = request.POST.get('page_name')
#         description = request.POST.get('description')
        
#         if not page_name:
#             return HttpResponseBadRequest("page name is not provided")
#         shop =  Shop.objects.filter(name=page_name).exists()
#         if shop:
#             return HttpResponseBadRequest("the boutique with name %s is already exist" % page_name)
#         appeal = Appeal(user=request.user, page_name=page_name)
#         appeal.save()
#         print('appeal regi..')
#         return HttpResponse("an appeal is registered")
#     if appeal:
#         return render(request, 'shop/appeal.html', {
#             'appeal': appeal
#         })
        
#     return render(request, 'shop/request.html')
    


@login_required
def check_for_shop_name(request:HttpRequest, shop_name):
    res = Shop.objects.filter(name=shop_name).exists()
    if res:
        return HttpResponseBadRequest("shop with this name is already exist")
    return HttpResponse("it's ok!")

@login_required
def add_edit_product(request:HttpRequest, product_id=None):
    print(product_id)
    print('add begins...')
    shop = get_object_or_404(Shop, seller=request.user)
    print('after...')
    if request.method == 'POST':
        form = AddProductForm(request.POST,files=request.FILES)
        if form.is_valid():
            id = form.cleaned_data['id']
            new_values = {
                'shop': shop,
                'brand' : form.cleaned_data['brand'],
                'type' : form.cleaned_data['type'],
                'subtype' : form.cleaned_data['subtype'],
                'price' : form.cleaned_data['price'],
                'name' : form.cleaned_data['name'],
                'description' : form.cleaned_data['description'],
                'is_available' : form.cleaned_data['is_available'],
                'quantity' : form.cleaned_data['quantity'],
                'keywords' : form.cleaned_data['keywords'],
                'attrs' : form.cleaned_data['attrs'],
                
            }
            categories = form.cleaned_data['categories']
            colors = form.cleaned_data['colors']
            sizes = form.cleaned_data['sizes']
            images = request.FILES.getlist("images")
            print('images:', images)

            try:
                product = Product.objects.get(id=id)
                for key,value in new_values.items():
                    setattr(product,key, value)
                product.categories.set(categories)
                product.colors.set(colors)
                product.sizes.set(sizes)
                product.save()
                if images:
                    for img in product.images.all():
                        img.image.delete()
                        img.delete()
                    for img in images:
                        if not img:
                            prodimg = ProductImage(product=product,image=img)
                            prodimg.save()
                return HttpResponse("update successfully")
                
            except Product.DoesNotExist:
                print('create new..')
                product = Product(**new_values)
                product.save()
                product.categories.set(categories)
                product.colors.set(colors)
                product.sizes.set(sizes)
                product.save()
                if images:
                    for img in images:
                        print('create images...')
                        print(img)
                        prodimg = ProductImage(product=product,image=img)
                        prodimg.save()
                return HttpResponse("added successfully")
        else:
            return HttpResponseBadRequest(form.errors)
    else:
        product = None
        if product_id:
             product = Product.objects.filter(id=product_id,shop=shop).first()
        return render(request, 'product/edit.html',{
            'product': product
        })

@login_required
def remove_product(request:HttpRequest, product_id):
    product = Product.objects.filter(id=product_id,shop=request.user.shop,is_active=True).first()
    if product:
        product.is_active = False
        product.save()
        return HttpResponse("product was sucessfully removed")
    
    return HttpResponseBadRequest("product was not found!")
    
    

def get_products_of_shop(reqest:HttpRequest, shop_name):  
    products = get_list_or_404(Product,shop__name=shop_name)
    paginator = Paginator(products, 20)
    pg_number = reqest.GET.get('pg')
    page = paginator.get_page(pg_number)
    return render(reqest, 'product/product_list.html', {
        'page': page
    })
        

def product_list(request:HttpRequest, shop_name):
    products = get_list_or_404(Product,shop__name=shop_name)
    return render(request,'shop/shop.html',{
        'products':products
    })
    

def product_detail(request:HttpRequest, product_id):
    product = get_object_or_404(Product,id=product_id)
    return render(request, 'product/product/detail.html',{
        'product':product
    })
    

def get_all_products(request:HttpRequest):
    products = Product.objects.all()
    paginator = Paginator(products, 20)
    pg_num = request.GET.get('pg')
    page = paginator.get_page(pg_num)
    return render(request,'',{
        'page':page
    })

def filter(request:HttpRequest, shop_name=None):
    pass


def search(request:HttpRequest, keywords):
    pass


def detail(request:HttpRequest):
    return render(request, 'product/add_edit/product.html')