from collections import namedtuple
from django.db.models.query import NamedValuesListIterable
from django.urls import path
from . import views

app_name = 'shops'
urlpatterns  = [
   # path('appeal/', views.make_appeal, name='appeal'),
    path('boutiques/', views.get_boutiques, name='boutiques'),
    path('product/detail/<product_id>/', views.product_detail, name='detail'),
    path('product/add/', views.add_product, name='add_product'),
    path('product/edit/<product_id>/', views.edit_product, name='edit_product'),
    path('product/remove/<product_id>/', views.remove_product, name='remove'),
    path('product/all/', views.get_all_products, name='all_products'),
    path('product/all/filter',views.filter, name='all_product_filter'),
    path('product/discounteds/', views.get_discounted_products, name='discounteds'),
    path('product/change_image/', views.change_image, name='change_image'),
    path('<shop_name>/filter/', views.filter, name='shop_filter'),
    path('<shop_name>/', views.get_products_of_shop, name='shop'),
    path('search/<pg>/', views.search, name='search'),
    path('shop/edit/', views.edit_shop, name='edit_shop'),
 
]
