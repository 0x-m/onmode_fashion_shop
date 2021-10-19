from django.contrib import admin
from django.contrib.admin.options import ModelAdmin
from .models import Collection, CollectionItem

# @admin.register(Collection)
# class CollectionAdmin(ModelAdmin):
#     list_display = ['name', 'description', 'is_active']
    

# @admin.register(CollectionItem)
# class CollectionItemAdmin(ModelAdmin):
#     list_display = ['Product','collection']