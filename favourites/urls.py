from django.urls import path
from . import views

app_name = 'favourites'
urlpatterns = [
    path('add/<product_id>/', views.add, name='add'),
    path('remove/<product_id>/', views.remove, name='remove'),
    path('', views.favourites, name='favourites')
]