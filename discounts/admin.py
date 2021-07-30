from .models import Discount
from django.contrib import admin
from django.core.validators import RegexValidator

# Register your models here.
 
@admin.register(Discount)
class DiscountAdmin(admin.ModelAdmin):
    
    
    def get_shop_name(instance,*args):
        return instance.product.shop.name
    get_shop_name.short_description = "نام بوتیک"
    fields = (('product','quantity','percent'),('date_from','date_to'),'is_active')
    raw_id_fields = ['product']
    list_display = [get_shop_name,'percent','quantity','is_active']
    list_editable = ['is_active']
    list_filter = ['product__categories','product__type','product__brand']
    search_fields = ['product__name','product__colors__name','product__shop__name']
    
    
    
 
