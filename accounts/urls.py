from django.urls import path
from . import views

app_name = 'accounts'
urlpatterns = [
    path('account/deposit/', views.deposit, name='deposit' ),
    path('account/checkout/', views.checkout_request, name='checkout'),
    path('account/wallet/', views.get_wallet, name='wallet'),
    path('account/withdraw/', views.withdraw, name='withdraw')
]