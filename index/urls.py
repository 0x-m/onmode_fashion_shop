
from django.urls import path
from . import views

app_name = 'home'
urlpatterns = [
    path('', views.home, name='home'),
    path('aboutus/', views.aboutUs, name='aboutus'),
    path('contactus', views.contactUs, name='contactus'),
    path('rules/',views.rules, name='rules')
]