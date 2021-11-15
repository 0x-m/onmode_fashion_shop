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
    
    def accept_request(modeladmin, request, qset):
        for p in qset:
            p.accept()
            
    def reject_request(modeladmin, request, qset):
        for p in qset:
            p.reject();
    actions = [accept_request, reject_request]
    fields = ['applicant', 'intendant','amount','fee_percent', 'fee_amount', 'final_amount', 'state', 'status', ('date_created', 'data_accomplished')]
    readonly_fields = ['applicant', 'intendant','fee_amount','fee_percent','final_amount', 'state', 'data_accomplished']
    list_display = ['applicant','amount', 'state', 'status', 'date_created']
    list_editable = ['status']

