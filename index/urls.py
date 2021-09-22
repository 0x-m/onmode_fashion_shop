from abc import get_cache_token
from collections import namedtuple
from index.utils import get_cities
from django.urls import path
from . import views

app_name = 'home'
urlpatterns = [
    path('', views.home, name='home'),
    path('aboutus/', views.aboutUs, name='aboutus'),
    path('contactus', views.contactUs, name='contactus'),
    path('rules/',views.rules, name='rules'),
    path('cities/', views.get_province_cities, name='get_cities'),
    path('rules', views.rules, name='rules'),
    path('test/', views.tss),
]