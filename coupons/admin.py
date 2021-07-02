from django.contrib.admin.options import ModelAdmin
from .models import Coupon
from django.contrib import admin

@admin.register(Coupon)
class CouponAdmin(ModelAdmin):
    readonly_fields = ['code']
    list_display = []