from django.contrib.admin.options import ModelAdmin
from .models import Coupon
from django.contrib import admin
from jalali_date.admin import ModelAdminJalaliMixin, StackedInlineJalaliMixin, TabularInlineJalaliMixin	
from jalali_date import datetime2jalali, date2jalali
from django.utils.translation import gettext_lazy as _

@admin.register(Coupon)
class CouponAdmin(ModelAdminJalaliMixin, ModelAdmin):
    
    @admin.display(description=_('Date from'))
    def get_date_from_in_jalali(instance):
        return datetime2jalali(instance.date_from)
    
    @admin.display(description=_('Date to'))
    def get_date_to_in_jalali(instance):
        return datetime2jalali(instance.date_to)
    
    readonly_fields = ['code']
    list_display = ['code',get_date_from_in_jalali,get_date_to_in_jalali,'type','is_active','is_used']
    list_editable = ['is_active','is_used']
    list_filter = ['is_active','is_used','date_to']