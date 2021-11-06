from django.contrib import admin
from django.contrib.admin.options import ModelAdmin, VERTICAL
from .models import  Brand, Category,   Product, Shop, SubType, Type, Collection
from django.utils.translation import gettext_lazy as _
from django.contrib.admin.sites import AdminSite


class ProductInline(admin.TabularInline):
    model = Product
    fields = ['name','type','subtype','price','quantity','date_created']
    readonly_fields = ['name','type','subtype','price','quantity','date_created']
   # list = ['name','type','subtype','price','quantity','date_created']
    
    

@admin.register(Shop)
class ShopAdmin(ModelAdmin):
    # fields = ['id','name','title','seller','shop_phone','address', 'date_created']
    readonly_fields = ['id','date_created']
    list_display = ['name','seller','is_active', 'date_created']
    list_editable = ['is_active']
    list_filter = ['is_active']
    search_fields = ['name','seller__phone_no']
    inlines = [
        ProductInline
    ]


@admin.register(Product)
class ProductCustomAdmin(ModelAdmin):
    list_display = ['shop','name', 'quantity','price', 'is_active']
    list_editable = ['is_active']
    readonly_fields = ['date_created']
    filter_horizontal = ['categories']
    search_fields = ['shop__name','brand','categories__name']
    list_filter = ['categories','type','subtype','brand','colors','sizes']
   
    

@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ['id','name']
    readonly_fields = ['slug']

@admin.register(Type)
class TypeAdmin(ModelAdmin):
    list_display = ['id','name']

@admin.register(SubType)
class SubtTypeAdmin(ModelAdmin):
    list_display = ['id','name']


@admin.register(Brand)
class BrandAdmin(ModelAdmin):
    list_display = ['id','name']

    
@admin.register(Collection)
class CollectionAdmin(ModelAdmin):
    raw_id_fields = ['products']
    readonly_fields = ['slug']
    list_display = ['id', 'name', 'slug']

