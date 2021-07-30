from django.utils.decorators import async_only_middleware
from .models import Order, OrderItem, OrderList
from django.contrib import admin
from django.utils.translation import gettext_lazy as _

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    @admin.display(description=_("coupon"))
    def get_coupon(instance):
        return str(instance.order.order_list.coupon)
    fields = ('product','quantity','price','discounted_price','discounted_total_price',get_coupon)
    readonly_fields = ['product','price','discounted_price',get_coupon]
    


@admin.register(Order)
class OrderCustomAdmin(admin.ModelAdmin):
    fields = [('user','shop'),('date_created','date_accomplished'),('total_price','discounted_total_price'),'tracking_code','state', 'verify_sent']
    readonly_fields = ['user', 'shop','date_created','date_accomplished']
    list_display = ["shop","user",'total_price','discounted_total_price', 'tracking_code', 'verify_sent','state', 'date_created']
    search_fields = ['user__phone_no','id']
    list_editable = ['verify_sent']
    list_filter = ['state','verify_sent','date_accomplished']
    inlines = [OrderItemInline]

    


@admin.register(OrderItem)
class OrderItemCustomAdmin(admin.ModelAdmin):
    fields = ['order', 'product', ('price','discounted_price'),('total_price','discounted_total_price'),'discount','color','size']
    list_filter = ['price']
    raw_id_fields = ['order','product']
    list_display = ['order','product','price','total_price']
    
    

@admin.register(OrderList)
class OrderListCustomAdmin(admin.ModelAdmin):
    fields = ['user',('total_price','total_price_after_discount','total_price_after_applying_coupon'),'coupon','is_paid','Address','use_default_address','post_method']
    readonly_fields = ['total_price','total_price_after_discount','total_price_after_applying_coupon','Address','coupon']
    raw_id_fields = ['user']
    search_fields = ['user__phone_no']
    list_filter = ['post_method','date_created','is_paid']
    list_display = ['user','total_price','total_price_after_discount','total_price_after_applying_coupon','post_method','coupon','is_paid']

    