from datetime import datetime
from ..models import Product, SubType, Category, Type
from orders.models import Order
from django import template;
from django.utils import timezone
from django.db.models import Count, Q
register = template.Library()
#--------------helper---------------
def to_int_list(str_list: str):
    return [int(i) for i in str_list.split(',')]

@register.inclusion_tag('filter/filter_template.html')
def filter_product(types="",
                   subtypes="",
                   categories="",
                   brands="",
                   colors="",
                   sizes="",
                   price_from=0,
                   price_to=0,
                   shop_name="",
                   date_from="",
                   date_to = "",
                   discounted='',
                   instock=True,
                   order_by='date',
                   order_kind='desc',
                   top=10,
                   min_likes=0,
                   max_likes=0,
                   min_sales=0,
                   max_sales=0,
                   ):
    products = Product.objects.all()
    
    if types:
        products &= products.filter(type__id__in=to_int_list(types))
    if subtypes:
        products &= products.filter(sub_type__id__in=to_int_list(subtypes)).distinct().all()
    if categories:
        products &= products.filter(categories__id__in=to_int_list(categories))
    if brands:
        products &= products.filter(brand__id__in=to_int_list(brands))
    if colors:
        products &= products.filter(color__id__in=to_int_list(colors))
    if sizes:
        products &= products.filter(sizes__id__in=to_int_list(sizes))
    if price_to:
        products &= products.filter(price__lte=int(price_to))
    if price_from:
        products &= products.filter(price__gte=int(price_from))
    if shop_name:
        products &= products.filter(shop__name=shop_name)
    if min_sales:
        products &= products.annotate(n_s=Count('sales', filter=Q(sales__order__state=Order.RECEIVED))).filter(n_s__lte=min_sales)
    if max_sales:
        products &= products.annotate(n_s=Count('sales', filter=Q(sales__order__state=Order.RECEIVED))).filter(n_s__gte=max_sales)
    if min_likes:
        products &= products.annotate(like_count=Count('favs')).filter(like_count__lte=min_likes)
    if max_likes:
        products &= products.annotate(like_count=Count('favs')).filter(like_count__gte=max_likes)
    if discounted:
        dt = timezone.now()
        products &= products.filter(discounts__is_active=True,
                                    discounts__date_to__gte=dt,
                                    discounts__date_from__lte=dt,
                                    discounts__quantity__gt=0)
        
    if date_from:
        dt = timezone.datetime.strptime(date_from, '')
        products &= products.filter(date_created__gte=dt)
    if date_to:
        dt = timezone.datetime.strptime(date_to, '')
        products &= products.filter(date_created__lte=dt)
        
    
    if instock:
        products &= products.filter(quantity__gte=0)
    order_cmd = ''
    if order_by:
        if order_by == 'desc':
            order_cmd += '-'
        elif order_by == 'asc':
            order_cmd +='+' 
    if order_kind:
        if order_kind == 'date':
            order_cmd += 'date'
        elif order_kind == 'price':
            order_cmd += 'price'
    if order_cmd:
        products = products.order_by(order_cmd)
               
    if len(products) >= top:
        products = products[:top]
            
    return {'products': products}

