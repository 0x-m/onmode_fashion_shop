from django.contrib import admin
from django.contrib.admin.options import ModelAdmin
from .models import Size,Color

@admin.register(Size)
class SizeAdmin(ModelAdmin):
    list_display = ['code']

@admin.register(Color)
class ColorAdmin(ModelAdmin):
    list_display = ['name', 'code']
