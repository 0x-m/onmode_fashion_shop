from os import name
from django.urls import path
from django.utils.regex_helper import normalize
from . import views

app_name='orders'
urlpatterns = [
    path('user/orders/<status>/', views.get_user_orders, name='user_orders'),
    path('user/order/<order_id>/', views.get_user_order_detail, name='user_order_detail'),
    path('user/order/<order_id>/cancell/', views.cancell_order, name='cancell_order'),
    path('user/order/<order_id>/verify/', views.verify_recieve_order, name='receive_order'),

    path('shop/orders/<status>/', views.get_shop_orders, name='shop_orders'),
    path('shop/order/<order_id>/', views.get_shop_order_detail, name="shop_order_detail"),
    path('shop/order/<order_id>/accept/', views.accept_order, name='accept_order'),
    path('shop/order/<order_id/reject/', views.reject_order, name='reject_order'),
    path('shop/order/<order_id>/tracking_code/', views.register_tracking_code, name='tracking_code'),
    
    path('shop/orders/', views.get_shop_orders, name='shop_orders'),
    path('user/order/<order_id>/detail/', views.get_user_order_detail, name='user_order_detail'),
    path('shop/order/<order_id>/detail/', views.get_shop_order_detail, name='shop_order_detail'),
    path('checkout/', views.checkout, name='checkout'),
    path('shop/order/<order_id>/accept/', views.accept_order),
]