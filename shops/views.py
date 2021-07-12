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
from index.utils import get_provinces
from .forms import AddProductForm, FilterForm, ShopInfoForm



@login_required
def check_for_shop_name(request:HttpRequest, shop_name):
    res = Shop.objects.filter(name=shop_name).exists()
    if res:
        return HttpResponseBadRequest("shop with this name is already exist")
    return HttpResponse("it's ok!")


@login_required
def add_product(request:HttpRequest):
    shop = get_object_or_404(Shop, seller=request.user, is_active=True)
    if request.method == "POST":
        form = AddProductForm(request.POST)
        if form.is_valid():
            new_values = {
                'shop': shop,
                'brand' : form.cleaned_data['brand'],
                'type' : form.cleaned_data['type'],
                'subtype' : form.cleaned_data['subtype'],
                'price' : form.cleaned_data['price'],
                'name' : form.cleaned_data['name'],
                'description' : form.cleaned_data['description'],
                'quantity' : form.cleaned_data['quantity'],
                'keywords' : form.cleaned_data['keywords'],
                'attrs' : form.cleaned_data['attrs'],
                
            }
            categories = form.cleaned_data['categories']
            colors = form.cleaned_data['colors']
            sizes = form.cleaned_data['sizes']
            images = request.FILES.getlist("images")
            
            product = Product(**new_values)
            product.save()
            product.categories.set(categories)
            product.colors.set(colors)
            product.sizes.set(sizes)
            product.save()
            if images:
                for img in images:
                    prodimg = ProductImage(product=product,image=img)
                    prodimg.save()
            return render(request, 'product/status.html',{
                'status_code': 200,
                'status': 'added successfully'
            })
        return render(request,'product/status.html', {
            'status_code': 401,
            "status": "add failed"
        })
    
    return render(request, 'product/edit.html',{
        'categories': Category.objects.all(),
        'types': Type.objects.all(),
        'subtypes': SubType.objects.all(),
        'brands': Brand.objects.all(),
        'colors': Color.objects.all(),
        'sizes': Size.objects.all(),
    })
            
@login_required
def edit_product(request:HttpRequest, product_id):
    shop = Shop.objects.filter(seller=request.user, is_active=True).first()
    product = Product.objects.filter(shop=shop,is_active=True,id=product_id).first()
    if not shop or not product:
        return HttpResponseForbidden("You are not allowed to edit the product with id=%i" % product_id)

    if request.method == "POST":
        form = AddProductForm(request.POST)
        if form.is_valid():
            new_values = {
                'brand' : form.cleaned_data['brand'],
                'type' : form.cleaned_data['type'],
                'subtype' : form.cleaned_data['subtype'],
                'price' : form.cleaned_data['price'],
                'name' : form.cleaned_data['name'],
                'description' : form.cleaned_data['description'],
                'quantity' : form.cleaned_data['quantity'],
                'keywords' : form.cleaned_data['keywords'],
                'attrs' : form.cleaned_data['attrs'],
                
            }
            categories = form.cleaned_data['categories']
            colors = form.cleaned_data['colors']
            sizes = form.cleaned_data['sizes']
        
            for key,value in new_values.items():
                setattr(product, key, value)
                
            product.categories.set(categories)
            product.colors.set(colors)
            product.sizes.set(sizes)
            product.save()
        else:
            return HttpResponseBadRequest("Invalid inputs")
    return render(request, 'product/edit.html',{
        'product': product,
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
            
            if not (productimg.product.shop == request.user.shop):
                return HttpResponseForbidden("you are not allowed...")
            if productimg:
                productimg.image.delete()
                productimg.image = img
                productimg.save()
                return HttpResponse(productimg.image.url)
            
            return HttpResponseBadRequest("image not found")
        return HttpResponseBadRequest("id or image was not provided")
    return HttpResponseNotAllowed(['POST'])
            
def get_products_of_shop(reqest:HttpRequest, shop_name):  

    shop = get_object_or_404(Shop, name=shop_name, is_active=True)
    products = Product.objects.filter(shop=shop, is_active=True).order_by('-date_created')
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
        
    


def get_all_products(request:HttpRequest):
    products = Product.objects.filter(is_active=True)
    paginator = Paginator(products, 20)
    
    pg_num = request.GET.get('pg')
    try:
        page = paginator.get_page(pg_num)
    except PageNotAnInteger:
        page = paginator.get_page(1)
    except EmptyPage:
        page = paginator.get_page(paginator.num_pages)
    
    return render(request,'product/all_product.html',{
        'page':page,
        'brands': Brand.objects.all(),
        'categories': Category.objects.all(),
        'colors': Color.objects.all(),
        'sizes': Size.objects.all(),
        'subtypes': SubType.objects.all(),
        'types': Type.objects.all(),
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



def product_detail(request:HttpRequest, product_id):
    product = get_object_or_404(Product,id=product_id,is_active=True)
    return render(request, 'product/product/detail.html',{
        'product':product
    })
    
def get_discounted_products(request:HttpRequest):
    dt = timezone.now()
    products = Product.objects.filter( discounts__is_active=True,
                                        discounts__date_from__gte=dt,
                                        discounts__date_to__lte=dt,
                                        discounts__quantity__gt=0).distinct().all()
       
    paginator = Paginator(products, 20)
    
    pg_num = request.GET.get('pg')
    try:
        page = paginator.get_page(pg_num)
    except PageNotAnInteger:
        page = paginator.get_page(1)
    except EmptyPage:
        page = paginator.get_page(paginator.num_pages)
    
    return render(request,'product/all_product.html',{
        'page':page,
        'brands': Brand.objects.all(),
        'categories': Category.objects.all(),
        'colors': Color.objects.all(),
        'sizes': Size.objects.all(),
        'subtypes': SubType.objects.all(),
        'types': Type.objects.all(),
    })

@login_required
def edit_shop(request:HttpRequest):
    if not request.user.shop.first():
        return HttpResponseBadRequest("you have no shop...!")
    
    print(request.FILES.get('logo'))
    shop = request.user.shop.first()

    print()
    post_destinations = shop.post_destinatinos.split(',')
    print(post_destinations)
    if request.method == "POST":
        form = ShopInfoForm(request.POST, instance=shop)
        banner = request.FILES.get('banner')
        logo = request.FILES.get('shop')
        if form.is_valid():
            shop = form.save()
            if logo:
                shop.logo = logo
            if banner:
                shop.banner = banner
            shop.save()
            return HttpResponse("edited successfully")
        else:
            return HttpResponseBadRequest("Invalid inputs..")
    return render(request, 'shop/edit_shop.html',{
        'provinces': get_provinces(),
        'post_destinations': post_destinations
        
    })

