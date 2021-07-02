from logging import setLogRecordFactory
from typing import Iterable, Optional
from django.db import models
from users.models import User
from django.utils.translation import gettext_lazy as _
import math

class Account(models.Model):
    user = models.OneToOneField(verbose_name=_('User'),to=User,on_delete=models.CASCADE,related_name='account')
    balance = models.DecimalField(verbose_name=_('Balance'),max_digits=15,decimal_places=0)
    last_updated = models.DateTimeField(verbose_name=_('Last Update'),auto_now=True)
    
    class Meta:
        verbose_name = _('Account')
        verbose_name_plural = _('Accounts')
    
    def __str__(self) -> str:
        return self.balance
    
    def deposit(self, amount):
        self.balance += amount
        self.save()
    
    def withdraw(self,amount):
        if (self.balance > amount):
            self.balance -= amount
            self.save()
        else:
            raise Exception()
        
    def has_enough_balance(self,balance):
        return self.balance >= balance
    
    
class CheckoutRequest(models.Model):
    PENDING = 'pending'
    ACCEPTED  = 'accepted'
    REJECTED = 'rejected'
    STATES = [
        (PENDING,_('pending')),
        (ACCEPTED,_('accepted')),
        (REJECTED, _('rejected'))
    ]
    
    class Meta:
        verbose_name = _('Checkout request')
        verbose_name_plura = _('Checkout requests')
    
    account = models.ForeignKey(verbose_name=_('Account'),to=Account,on_delete=models.CASCADE,related_name='checkouts')
    date_created = models.DateField(verbose_name=_('Date created'),auto_now=True)
    amount = models.DecimalField(verbose_name=_('Amount'),max_digits=15,decimal_places=0)
    description = models.TextField(verbose_name=_('Description'),max_length=500,null=True)
    state = models.CharField(verbose_name=_('state'),choices=STATES,default='pending',max_length=20)
    status = models.TextField(verbose_name=_('status'),max_length=500, null=True)
    fee = models.DecimalField(verbose_name=_('Fee'),decimal_places=0,max_digits=15, default=0)
    final_amount = models.DecimalField(verbose_name=_('Final Amount'), max_digits=15, decimal_places=0, default=0)
    
    def save(self,*arg, **kwargs):
        self.fee = math.floor((self.account.user.fee / 100) * self.amount)
        self.final_amount = self.amount - self.fee
        super().save(*arg, **kwargs)
        
    class Meta:
        verbose_name = _('Checkout Request')
        verbose_name_plural = _('Checkout Requests')
    
    def accept(self):
        self.state = self.ACCEPTED
        #-------- othr actions------
        self.account.withdraw(self.amount)
        self.save()
    
    def reject(self,status=None):
        self.state = self.REJECTED
        #--------other actions-------
        #----------------------------
        if status:
            self.status = status       
        self.save()


class TransferTransaction(models.Model):
    PENDING = 'pending'
    COMMITTED = 'committed'
    ROLLBACKED = 'rollbacked'
    STATES = [
        (PENDING,_('prepared')),
        (COMMITTED, _('committed')),
        (ROLLBACKED, _('rollbacked'))
    ]
    
    debtor = models.ForeignKey(verbose_name=_('debtor'),to=Account,on_delete=models.CASCADE, related_name='debts')
    creditor = models.ForeignKey(verbose_name=_('creditor'),to=Account,on_delete=models.CASCADE, related_name='credits')
    date_created = models.DateTimeField(verbose_name=_('Date created'),auto_now_add=True)
    amount = models.DecimalField(verbose_name=_('Amount'),max_digits=15, decimal_places=0)
    state = models.CharField(verbose_name=_('State'),choices=STATES, default='pending',max_length=20)

    class Meta:
        verbose_name = _('Transfer Transaction')
        verbose_name_plural = _('Transfer Tranactions')
    
 
    
    def __prepare(self):
        self.debtor.widthraw(self.amount)
          
    def commit(self):
        self.creditor.deposit(self.amount)
        self.state = self.COMMITTED
        self.save()
    
    def rollback(self):
        self.debtor.deposit(self.amount)
        self.creditor.widthraw(self.amount)
        self.state = self.ROLLBACKED
        self.save()

    def save(self, force_insert: bool, 
             force_update: bool, 
             using: Optional[str], 
             update_fields: Optional[Iterable[str]]) -> None:
        self.__prepare()
        return super().save(force_insert=force_insert, force_update=force_update, using=using, update_fields=update_fields)



        
class DepositTransaction(models.Model):
    PENDING = 'pending'
    COMMITTED = 'committed'
    STATES = [
        (COMMITTED, _('committed')),
        (PENDING, _('pending'))
    ]
    
    
    account = models.ForeignKey(verbose_name=_('Account'),to=Account,on_delete=models.CASCADE, related_name='deposits')
    amount = models.PositiveIntegerField(verbose_name=_('Amount'))
    date_created = models.DateTimeField(verbose_name=_('Date Created'),auto_now_add=True)
    state = models.CharField(max_length=20,choices=STATES,default='pending')
    
    
    class Meta:
        verbose_name = _('Deposit Transaction')
        verbose_name_plural = _('Deposit Transactions')    

    def __str__(self) -> str:
        return self.amount
    
    def apply(self):
        if not self.state == self.COMMITTED:
            self.account.deposit(self.amount)
            self.state = self.COMMITTED
            self.save()
    
         


    


