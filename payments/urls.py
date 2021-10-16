from django.conf.urls import url
from . import views

app_name = 'payments'
urlpatterns = [
    url('pay/', views.pay, name='request'),
    url('verify/', views.verify , name='verify'),
]