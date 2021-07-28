from django.contrib import admin
from django.contrib.admin.options import ModelAdmin
from .models import  Brand, Category,   Product, Shop, SubType, Type
from django.utils.translation import gettext_lazy as _

class ProductInline(admin.TabularInline):
    model = Product
    fields = ['name','type','subtype','price','quantity','date_created']
    readonly_fields = ['name','type','subtype','price','quantity','date_created']
   # list = ['name','type','subtype','price','quantity','date_created']
    
    

@admin.register(Shop)
class ShopAdmin(ModelAdmin):
    #fields = ['name','seller','fee','is_active', 'date_created']
    readonly_fields = ['date_created']
    list_display = ['name','seller','is_active', 'date_created']
    list_editable = ['is_active']
    inlines = [
        ProductInline
    ]


@admin.register(Product)
class ProductCustomAdmin(ModelAdmin):
    list_display = ['shop','name', 'quantity', 'is_active']
    list_editable = ['is_active']
    readonly_fields = ['date_created']
   
    

@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ['name', 'is_active']

@admin.register(Type)
class TypeAdmin(ModelAdmin):
    list_display = ['name', 'is_active']

@admin.register(SubType)
class SubtTypeAdmin(ModelAdmin):
    list_display = ['name', 'type']


@admin.register(Brand)
class BrandAdmin(ModelAdmin):
    list_display = ['name', 'slug', 'is_active']
    list_editable = ['is_active']
    readonly_fields = ['slug']
