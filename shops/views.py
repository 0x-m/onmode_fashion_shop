from typing import ClassVar
from django.forms import forms
from django.http.response import FileResponse, Http404, HttpResponse, HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNotAllowed
from .models import  Product, Shop
from django import http
from django.http.request import HttpRequest
from django.shortcuts import redirect, render
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_list_or_404, get_object_or_404
from .models import *
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from discounts.models import Discount
from django.utils import timezone
from django.db.models import Q

from .forms import AddProductForm, FilterForm
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

    shop = get_object_or_404(Shop, seller=request.user)
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
                if product.shop.seller != request.user:
                    return HttpResponseForbidden("you are not allowed to update this product")
                
                for key,value in new_values.items():
                    setattr(product,key, value)
                    
                product.categories.set(categories)
                product.colors.set(colors)
                product.sizes.set(sizes)
                product.save()
                # if images:
                #     for img in product.images.all():
                #         img.image.delete()
                #         img.delete()
                #     for img in images:
                #         if not img:
                #             prodimg = ProductImage(product=product,image=img)
                #             prodimg.save()
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
        else:
            product_id = -1
        return render(request, 'product/edit.html',{
            'product': product,
            'product_id': product_id,
            'categories': Category.objects.all(),
            'types': Type.objects.all(),
            'subtypes': SubType.objects.all(),
            'brands': Brand.objects.all(),
            'colors': Color.objects.all(),
            'sizes': Size.objects.all(),
            
        })

@login_required
def remove_product(request:HttpRequest, product_id):
    product = Product.objects.filter(id=product_id,shop=request.user.shop,is_active=True).first()
    if product:
        product.is_active = False
        product.save()
        return HttpResponse("product was sucessfully removed")
    
    return HttpResponseBadRequest("product was not found!")
    
    

@login_required
def change_image(request: HttpRequest):
    if request.method == 'POST':
        id = request.POST.get('id')
        img = request.FILES.get('image')
        if id and img:
            productimg = ProductImage.objects.filter(id=id).first()
            if productimg:
                productimg.image.delete()
                productimg.image = img
                productimg.save()
                return HttpResponse(productimg.image.url)
            return HttpResponseBadRequest("image not found")
        return HttpResponseBadRequest("id or image was not provided")
    return HttpResponseNotAllowed(['POST'])
            
def get_products_of_shop(reqest:HttpRequest, shop_name):  
    products = get_list_or_404(Product,shop__name=shop_name)
    shop = Shop.objects.get(name=shop_name)
    paginator = Paginator(products, 20)
    pg_number = reqest.GET.get('pg')
    try:
        page = paginator.get_page(pg_number)
    except PageNotAnInteger:
        page = paginator.get_page(1)
    except EmptyPage:
        page = paginator.get_page(paginator.num_pages)
    page = paginator.get_page(pg_number)
    return render(reqest, 'shop/shop.html', {
        'page': page,
        'shop': shop,
        'brands': Brand.objects.all(),
        'categories': Category.objects.all(),
        'colors': Color.objects.all(),
        'sizes': Size.objects.all(),
        'subtypes': SubType.objects.all(),
        'types': Type.objects.all(),
        
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
    try:
        page = paginator.get_page(pg_num)
    except PageNotAnInteger:
        page = paginator.get_page(1)
    except EmptyPage:
        page = paginator.get_page(paginator.num_pages)
    
    return render(request,'',{
        'page':page,
        'brands': Brand.objects.all(),
        'categories': Category.objects.all(),
    })

def filter(request:HttpRequest,shop_name=None):
    
    filter_form = FilterForm(request.GET)
    if filter_form.is_valid():
        shop = Shop.objects.filter(name=shop_name).first()
        categories = filter_form.cleaned_data['categories']
        brands = filter_form.cleaned_data['brands']
        sizes  = filter_form.cleaned_data['sizes']
        colors = filter_form.cleaned_data['colors']
        types = filter_form.cleaned_data['types']
        subtypes = filter_form.cleaned_data['subtypes']
        discounted_only = filter_form.cleaned_data['discounted']
        order_by = filter_form.cleaned_data['order_by']
        order_kind = filter_form.cleaned_data['order_kind']
        price_from = filter_form.cleaned_data['price_from']
        price_to = filter_form.cleaned_data['price_to']
        print(categories,"  ", brands, " " , colors, sizes,
              types, subtypes,price_from, price_to )
        if order_kind == 'desc':
            order_by = '-' + order_by
        
        products = Product.objects.filter(type__id__in =types,
                           subtype__id__in=subtypes,
                            categories__id__in=categories,
                            brand__id__in=brands,
                            sizes__id__in=sizes,
                            colors__id__in=colors,
                            price__lte=price_to,
                            price__gte=price_from).distinct().order_by(order_by)
    
        print("prod_num: ",len(products))
        print(products.query)
        if shop:
            products &= Product.objects.filter(shop=shop).distinct().all()
        if discounted_only:
            dt = timezone.now()
            products &= Product.objects.filter( discounts__is_active=True,
                                                discounts__date_from__gte=dt,
                                                discounts__date_to__lte=dt,
                                                discounts__quantity__gt=0).distinct().all()
       
        
        paginator = Paginator(products, 20)
        pg_num = request.GET.get('pg')
            
        page = paginator.get_page(pg_num)
        try:
            page = paginator.get_page(pg_num)
        except PageNotAnInteger:
            page = paginator.get_page(1)
        except EmptyPage:
            page = paginator.get_page(paginator.num_pages)
            
        temp = 'product/all_products.html'
        if shop:
            temp = 'shop/shop.html'
            
        
        return render(request,temp,{
            'page': page,
            'brands': Brand.objects.all(),
            'categories': Category.objects.all(),
            'types': Type.objects.all(),
            'subtypes': SubType.objects.all(),
            'colors': Color.objects.all(),
            'sizes': Size.objects.all(),
            'shop': shop,
            
        })
    else:
        return HttpResponse(filter_form.errors)
        
    return Http404()
        
def search(request:HttpRequest, pg):
    keywords = request.GET.get('keywords')
    products = Product.objects.filter(Q(name__icontains=keywords) | 
                                      Q(description__icontains=keywords) | 
                                      Q(keywords__icontains=keywords))
    paginator = Paginator(products,40)
    try:
        page = paginator.get_page(pg)
    except PageNotAnInteger:
        page = paginator.get_page(1)
    except EmptyPage:
        page = paginator.get_page(paginator.num_pages)
        
    return render(request,'product/all_products.html',{
        'page': page,
        'brands': Brand.objects.all(),
        'categories': Category.objects.all(),
        'types': Type.objects.all(),
        'subtypes': SubType.objects.all(),
        'colors': Color.objects.all(),
        'sizes': Size.objects.all(),
        
    })


def detail(request:HttpRequest, product_id):
    print("detail....")
    product = get_object_or_404(Product,id=product_id)
    return render(request, 'product/detail/product.html',{
        'product': product
    })
    