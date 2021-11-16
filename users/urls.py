from collections import namedtuple
from django.urls import path
from . import views

app_name = "users"
urlpatterns = [
    path('enrollment/',views.enrollment, name='enrollment'),
    path('verification/',views.verification, name='verification'),
    path('set_password/',views.set_password, name='set_password'),
    path('reset_password/', views.reset_password, name='reset_password'),
    path('profile/',views.profile, name='profile'),
    path('dashboard/',views.dashboard, name='dashboard'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('check_email/', views.check_email, name='check_email')
]