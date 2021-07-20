from .models import Order, OrderItem, OrderList
from django.contrib import admin

@admin.register(Order)
class OrderCustomAdmin(admin.ModelAdmin):
    fields = ['order_list','user','shop','discounted_total_price','tracking_code','state', 'verify_sent']
    list_display = ["user", 'discounted_total_price', 'tracking_code', 'verify_sent', 'date_created']
    list_editable = ['verify_sent']

@admin.register(OrderItem)
class OrderItemCustomAdmin(admin.ModelAdmin):
    list_display = ['price','total_price']


@admin.register(OrderList)
class OrderItemCustomAdmin(admin.ModelAdmin):
    list_display = ['total_price','total_price_after_discount']
    