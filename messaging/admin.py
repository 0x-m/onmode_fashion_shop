from django.contrib import admin
from django.db.models import fields
from django.db.models.base import Model
from .models import AdminMessage
from django.contrib.admin import ModelAdmin

@admin.register(AdminMessage)
class CustomMessage(ModelAdmin):
    raw_id_fields = ['sender', 'reciever']