from django.conf.urls import url
from . import views


app_name = 'payments'
urlpatterns = [
    url('pay/', views.pay, name='pay'),
    url('verify/', views.verify , name='verify'),
    url('dispatch/', views.dispatch_pay, name='dispatch'),
    url('deposit', views._deposit_account, name='deposit'),
    url('checkout', views._checkout_cart)
]