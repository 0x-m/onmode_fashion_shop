from django.contrib import admin
from django.contrib.admin.options import ModelAdmin
from .models import PaymentTransaction
from django.contrib.admin.decorators import register

@admin.register(PaymentTransaction)
class PaymentAdmin(ModelAdmin):
    list_display = ['user', 'ref_id', 'code']