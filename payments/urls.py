from django.conf.urls import url
from . import views

app_name = 'payments'
urlpatterns = [
    url('request/', views.send_request, name='request'),
    url('verify/', views.verify , name='verify'),
]