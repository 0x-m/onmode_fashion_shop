from os import name
from django.urls import path
from . import views

app_name='orders'
urlpatterns = [
    path('user/', views.get_user_orders, name='user_orders' ),
    path('shop/', views.get_shop_orders, name='shop_orders'),
    path('user/detail/<order_id>', views.get_user_order_detail, name='user_order_detail'),
    path('shop/detail/<order_id>', views.get_shop_order_detail, name='shop_order_detail'),
    path('checkout/', views.checkout, name='checkout'),
    
]