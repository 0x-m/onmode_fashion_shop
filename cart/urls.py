from django.urls import path
from . import views

app_name = 'cart'
urlpatterns = [
    path('add/<product_id>/', views.add, name='add'),
    path('remove/<product_id>/', views.remove, name='remove'),
    path('increment/<product_id>/', views.increment, name='increment'),
    path('decrement/<product_id>/', views.decrement, name='decrement'),
    path('apply_coupon/<code>/', views.apply_coupon, name='apply_coupon'),
    path('clear/', views.clear_cart, name='clear'),
    path('checkout/', views.checkout, name='checkout'),
    path('set_color/', views.change_product_color, name='change_color'),
    path('set_size/', views.change_product_size, name='change_size'),
    path('',views.cart_list, name='cart_list'),
]