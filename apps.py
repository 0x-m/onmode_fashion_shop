from django.contrib import admin
from django.contrib.admin.apps import AdminConfig
from django.contrib.admin.sites import site

class MyAdminSite(admin.AdminSite):
    site_header = "ONMODE"
    empty_value_display = "-"
    site_title = "فروشگاه آنمد"
    index_title = "مدیریت فروشگاه آنمد"
    
class MyAdminConfig(AdminConfig):
    default_site = 'apps.MyAdminSite'
    