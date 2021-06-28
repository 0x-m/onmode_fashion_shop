from django.urls import path
from . import views

app_name = 'shops'
urlpatterns  = [
    path('detail/', views.detail, name='detail')
]