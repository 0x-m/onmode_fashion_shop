from django.contrib import admin
from django.contrib.admin.options import ModelAdmin
from .models import Brand, Category, Collection, Color, Product, Shop, Size, Type, CollectionItem

class ProductInline(admin.TabularInline):
    model = Product
    fields = ['name','type','subtype','price','quantity','date_created']
    readonly_fields = ['name','type','subtype','price','quantity','date_created']
   # list = ['name','type','subtype','price','quantity','date_created']
    
    

@admin.register(Shop)
class ShopAdmin(ModelAdmin):
    #fields = ['name','seller','fee','is_active', 'date_created']
    readonly_fields = ['date_created']
    list_display = ['name','seller','fee','is_active', 'date_created']
    list_editable = ['is_active']
    inlines = [
        ProductInline
    ]



@admin.register(Product)
class ProductCustomAdmin(ModelAdmin):
    list_display = ['shop','name', 'quantity']
    

@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ['name', 'is_active']

@admin.register(Type)
class TypeAdmin(ModelAdmin):
    list_display = ['name', 'is_active']
@admin.register(Size)
class SizeAdmin(ModelAdmin):
    list_display = ['code', 'description']

@admin.register(Color)
class ColorAdmin(ModelAdmin):
    list_display = ['name', 'code']

@admin.register(Brand)
class BrandAdmin(ModelAdmin):
    list_display = ['name', 'slug']

@admin.register(Collection)
class CollectionAdmin(ModelAdmin):
    list_display = ['name', 'description', 'is_active']

@admin.register(CollectionItem)
class CollectionItemAdmin(ModelAdmin):
    list_display = ['Product','collection']