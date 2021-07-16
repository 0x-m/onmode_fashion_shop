from os import name
from django.urls import path
from . import views

app_name='orders'
urlpatterns = [
    path('all/', views.orders, name='orders' )
]