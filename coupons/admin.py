from django.contrib.admin.options import ModelAdmin
from .models import Coupon
from django.contrib import admin

@admin.register(Coupon)
class CouponAdmin(ModelAdmin):
    readonly_fields = ['code']
    list_display = ['code','date_from','date_to','type','is_active','is_used']
    list_editable = ['is_active','is_used']
    list_filter = ['is_active','is_used','date_to']