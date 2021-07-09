from django.urls import path
from . import views

app_name = 'messaging'
urlpatterns = [
    path('', views.get_messages, name='get_messages'),
]