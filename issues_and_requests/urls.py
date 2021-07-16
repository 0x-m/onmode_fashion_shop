from django.urls import path
from . import views

app_name = 'issues'
urlpatterns = [
    path('appeal/register/', views.make_appeal, name='appeal'),
    path('issue/register/', views.make_issue, name='issue'),
    
]