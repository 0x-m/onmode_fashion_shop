from django.contrib.admin.options import ModelAdmin
from .models import Account,DepositTransaction, TransferTransaction,CheckoutRequest

from django.contrib import admin

@admin.register(Account)
class AccountAdmin(ModelAdmin):
    list_display = ['user', 'balance', 'last_updated']
    readonly_fields = ['last_updated']

@admin.register(DepositTransaction)
class DepositTransaction(ModelAdmin):
    pass

@admin.register(TransferTransaction)
class TransferTransaction(ModelAdmin):
    list_display = ['debtor', 'creditor', 'amount', 'state', 'date_created']
    readonly_fields = ['date_created']

@admin.register(CheckoutRequest)
class CheckoutRequest(ModelAdmin):
    
    # @property
    # def user(self, obj):
    #     return obj.account.user.phone_no
    
    list_display = ['account', 'amount', 'state', 'status', 'date_created']
    readonly_fields = ['date_created']

