from django.urls import path
from . import views

app_name = 'cart'
urlpatterns = [
    path('add/<product_id>', views.add, name='add'),
    path('remove/<product_id>', views.remove, name='remove'),
    path('increment/<product_id>', views.increment, name='increment'),
    path('decrement/<product_id>', views.decrement, name='decrement'),
    path('apply_coupon/<code>', views.apply_coupon, name='apply_coupon'),
    path('checkout/', views.checkout, name='checkout'),
    path('',views.cart_list, name='cart_list'),
]