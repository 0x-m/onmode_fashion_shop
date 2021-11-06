from django.urls import path
from . import views

app_name = 'messaging'
urlpatterns = [
    path('', views.get_messages, name='get_messages'),
    path('messages/<id>/mark_as_read/', views.mark_as_read, name="msg")
]