from .models import Order
from django.contrib import admin

@admin.register(Order)
class OrderCustomAdmin(admin.ModelAdmin):
    fields = ['user','shop','discounted_total_price','tracking_code','state', 'verify_sent']
    list_display = [ 'discounted_total_price', 'tracking_code', 'verify_sent', 'date_created']