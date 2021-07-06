from collections import namedtuple
from django.urls import path
from . import views

app_name = 'shops'
urlpatterns  = [
   # path('appeal/', views.make_appeal, name='appeal'),
    path('product/detail/<product_id>/', views.detail, name='detail'),
    path('product/add_edit/', views.add_edit_product, name='add_edit'),
    path('product/all/', views.get_all_products, name='all_products'),
    path('product/all/filter',views.filter, name='all_product_filter'),
    path('product/add_edit/<int:product_id>/', views.add_edit_product, name='add_edit'),
    path('change_image/', views.change_image, name='change_image'),
    path('<shop_name>/filter/', views.filter, name='shop_product_filter'),
    path('<shop_name>/', views.get_products_of_shop, name='shop'),
    path('search/<pg>/', views.search, name='search'),
    
]