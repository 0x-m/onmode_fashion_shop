from collections import namedtuple
from django.urls import path
from . import views

app_name = 'shops'
urlpatterns  = [
   # path('appeal/', views.make_appeal, name='appeal'),
    path('detail/', views.detail, name='detail'),
    path('add_edit/', views.add_edit_product, name='add_edit'),
    path('add_edit/<int:product_id>/', views.add_edit_product, name='add_edit')
]