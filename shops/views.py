from reviews.models import Comment
from typing import ClassVar
from django.db.models.query import RawQuerySet
from django.forms import forms
from django.http.response import FileResponse, Http404, HttpResponse, HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNotAllowed, JsonResponse
from .models import  Product, Shop
from django import http
from django.http.request import HttpRequest
from django.shortcuts import redirect, render, resolve_url
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_list_or_404, get_object_or_404
from .models import *
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from discounts.models import Discount
from django.utils import timezone
from django.db.models import Q
from index.utils import get_provinces
from .forms import AddProductForm, FilterForm, ShopInfoForm
from django.contrib.staticfiles.storage import staticfiles_storage
from random import shuffle

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
        print(request.POST['free_delivery'])
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
            'free_delivery': form.cleaned_data['free_delivery']
                
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
                num_img = len(images)
                if  num_img > 5:
                    images = images[:5]
                    
                for img in images:
                    prodimg = ProductImage(product=product,image=img)
                    prodimg.save()
                
                if num_img < 5 :
                    for i in range(num_img,5):
                        empty_img = ProductImage(product=product)
                        empty_img.save()
            else:
                for i in range(0,5):
                    empty_img = ProductImage(product=product)
                    empty_img.save()
               
            return HttpResponse("added successfully")
        return HttpResponseBadRequest(form.errors)
    
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
    product = Product.objects.filter(id=product_id,shop=request.user.shop.first(),is_active=True).first()
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
        change_avatar = request.POST.get('change_avatar')
        if id and img:
            productimg = ProductImage.objects.filter(id=id).first()
            
            if not (productimg.product.shop == request.user.shop.first()):
                return HttpResponseForbidden("you are not allowed...")
            if productimg:                    
                if productimg.image:
                    productimg.image.delete()
                productimg.image = img
                productimg.save()
                return HttpResponse(productimg.image.url)
            
            return HttpResponseBadRequest("image not found")
        return HttpResponseBadRequest("id or image was not provided")
    return HttpResponseNotAllowed(['POST'])
            
def get_products_of_shop(request:HttpRequest, shop_name):  
    
    shop = get_object_or_404(Shop, name=shop_name, is_active=True)
    products = Product.objects.filter(shop=shop, is_active=True).order_by('-date_created')
    print(len(products), shop.name)
    paginator = Paginator(products, 20, allow_empty_first_page=True)
    pg_number = request.GET.get('pg')
    print("page_number:",pg_number)
    print(paginator.num_pages)
    try:
        page = paginator.get_page(pg_number)
        print("get_page", page)
    except PageNotAnInteger:
        page = paginator.get_page(1)
    except EmptyPage:
        page = paginator.get_page(paginator.num_pages)
    except:
        print("error")
     
    return render(request, 'shop/shop.html', {
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
    
    return render(request,'index/all_products.html',{
        'page':page,

    })

def filter(request:HttpRequest,shop_name=None):
    
    filter_form = FilterForm(request.GET)
    discounted_only = request.POST.get('discounted')
    print(request.POST.get('discounted'))
    if filter_form.is_valid():
        categories = filter_form.cleaned_data['categories']
        brands = filter_form.cleaned_data['brands']
        sizes  = filter_form.cleaned_data['sizes']
        colors = filter_form.cleaned_data['colors']
        types = filter_form.cleaned_data['types']
        subtypes = filter_form.cleaned_data['subtypes']
        order_by = filter_form.cleaned_data['order_by']
        order_kind = filter_form.cleaned_data['order_kind']
        price_from = filter_form.cleaned_data['price_from']
        price_to = filter_form.cleaned_data['price_to']
        print(categories,"  ", brands, " " , colors, sizes,
              types, subtypes,price_from, price_to )
        if order_kind == 'desc':
            order_by = '-' + order_by
        
        products = Product.objects.filter(type__id__in =types,is_active=True,
                           subtype__id__in=subtypes,
                            categories__id__in=categories,
                            brand__id__in=brands,
                            sizes__id__in=sizes,
                            colors__id__in=colors,
                            price__lte=price_to,
                            price__gte=price_from).distinct().order_by(order_by)
    
        print("number:", len(products))
        shop = None
        if shop_name:
            shop = Shop.objects.filter(name=shop_name).first()
            print(shop.name)
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
        
    return render(request,'index/search_result.html',{
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
    comments = Comment.objects.filter(product=product).all()
    paginator = Paginator(comments, 20)
    page_no = request.GET.get('pg');
    try:
        page = paginator.get_page(page_no)
    except PageNotAnInteger:
        page = paginator.get_page(1)
    except EmptyPage:
        page = paginator.get_page(paginator.num_pages)
    
    user_comment = None
    liked = None
    if request.user.is_authenticated:
        user_comment = comments.filter(user=request.user).first();
        liked = product.favs.filter(user=request.user).count()
    related_products = Product.objects.filter(type=product.type)[:10]
    print(user_comment, '---------------------')
    return render(request, 'product/detail/product.html',{
        'product':product,
        'page': page,
        'user_comment': user_comment,
        'related_products':related_products,
        'liked': liked
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
    
    shop = request.user.shop.first()
    post_destinations = '';
    if shop.post_destinations:
        post_destinations = shop.post_destinations.split(',')

    if request.method == "POST":
        all_states = request.POST.get('overall')
        all_states = True if (all_states == 'true') else False
        form = ShopInfoForm(request.POST, instance=shop)
        banner = request.FILES.get('banner')
        logo = request.FILES.get('logo')
        if form.is_valid():
            shop = form.save()
            if logo:
                shop.logo.delete()
                shop.logo = logo
            if banner:
                shop.banner.delete()
                shop.banner = banner

            shop.convers_all_states = all_states
            shop.save()
            return HttpResponse("edited successfully")
        else:
            print(form.errors)
            return HttpResponseBadRequest("Invalid inputs..")
            
    return render(request, 'shop/edit_shop.html',{
        'provinces': get_provinces(),
        'post_destinations': post_destinations
        
    })

@login_required
def change_shop_logo(request:HttpRequest):
    if not request.is_seller():
        return HttpResponseBadRequest("Your are not allowed....")
    if request.method == 'POST':
        shop = request.user.shop.first()
        logo = request.FILES.get('logo');
        if logo:
            shop.logo.delete()
            shop.logo = logo
            shop.save()
            return HttpResponse('logo changed successfully')
    
    return HttpResponseNotAllowed(['POST'])
        

@login_required
def change_shop_banner(request:HttpRequest):
    if not request.is_seller():
        return HttpResponseBadRequest("Your are not allowed....")
    if request.method == 'POST':
        shop = request.user.shop.first()
        banner = request.FILES.get('banner');
        if banner:
            shop.banner.delete()
            shop.banner = banner
            shop.save()
            return HttpResponse('logo changed successfully')
    
    return HttpResponseNotAllowed(['POST'])
 
 
def get_boutiques(request: HttpRequest):
    boutiques = Shop.objects.all()
    boutique_list = list(boutiques)
    shuffle(boutique_list)
    print(len(boutiques), 'number of boutiques')
#    # paginator = Paginator(boutiques, 100)
#     pg_num = request.GET.get('pg')
#     try:
#         page = paginator.get_page(pg_num)
#     except PageNotAnInteger:
#         page = paginator.get_page(1)
#     except EmptyPage:
#         page = paginator.get_page(paginator.num_pages)
    
    return render(request, 'index/boutiques.html', {
        'boutiques': boutique_list
    })
    
 
@login_required
def get_types(request: HttpRequest):

    categories_string = request.GET.get('cats')
    categories = [int(i) for i in categories_string.split(',')]
    print(categories)
    print('sdfsfsfsfds')
    types = {}
    if len(categories):
        types = Type.objects.filter(categories__id__in=categories).distinct().values('id', 'name')
    print(types)

    return JsonResponse({
        "types": list(types)
    })
 
@login_required
def get_subtypes(request: HttpRequest):
    type = request.GET.get('type')
    types = [int(type)]
    categories = request.GET.get('cats')
    categories = [int(i) for i in categories.split(',')]
    subtypes = SubType.objects.filter(types__id__in=types, categories__id__in=categories).distinct().values('id', 'name')
    return JsonResponse({
        "subtypes": list(subtypes)
    })
    
