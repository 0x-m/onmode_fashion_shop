from .models import Discount
from django.contrib import admin

from jalali_date.admin import ModelAdminJalaliMixin	
from jalali_date import datetime2jalali
from django.utils.translation import gettext_lazy as _

# Register your models here.
 
@admin.register(Discount)
class DiscountAdmin(ModelAdminJalaliMixin, admin.ModelAdmin):
    
    
    def get_shop_name(instance, *args):
        return instance.product.shop.name
    get_shop_name.short_description = "نام بوتیک"
    
    @admin.display(description=_('Date from'))
    def get_date_from_in_jalali(instance):
        return datetime2jalali(instance.date_from)
    
    @admin.display(description=_('Date to'))
    def get_date_to_in_jalali(instance):
        return datetime2jalali(instance.date_to)
    
    
    fields = (('product','quantity','percent'),'is_active','date_from', 'date_to')
    raw_id_fields = ['product']
    list_display = [get_shop_name,'percent','quantity','is_active',get_date_from_in_jalali, get_date_to_in_jalali]
    list_editable = ['is_active']
    list_filter = ['product__categories','product__type','product__brand']
    search_fields = ['product__name','product__colors__name','product__shop__name']
    
    
    
 
