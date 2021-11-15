from django.core.validators import  MaxValueValidator, MinValueValidator
from django.db import models
from users.models import User
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import ModelSignal, post_migrate, post_save
import math
from django.utils import timezone
from django.db.models.aggregates import Sum



class Account(models.Model):
    user = models.OneToOneField(verbose_name=_('User'),to=User,on_delete=models.CASCADE,related_name='account')
    balance = models.DecimalField(verbose_name=_('Balance'),max_digits=15,decimal_places=0,default=0)
    last_updated = models.DateTimeField(verbose_name=_('Last Update'),auto_now=True)
    
    class Meta:
        verbose_name = _('Account')
        verbose_name_plural = _('Accounts')
    
    def __str__(self) -> str:
        return str(self.balance)
    
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
    
    @classmethod
    def create_account_for_user(cls,sender,instance, created,*args,**kwargs):
        if created:
            acc = Account(user=instance)
            acc.save()
            
    @property
    def get_credits(self):
        if len(self.credits.all()):
            c = self.credits.all().aggregate(Sum('amount'))
            return c
        return 0
        

post_save.connect(Account.create_account_for_user, sender=User)

    
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
    applicant = models.ForeignKey(verbose_name=_('Applicant'),to=User,related_name='checkouts', on_delete=models.CASCADE,blank=True, null=True)
    intendant = models.OneToOneField(verbose_name=_('Intendant'),to=User,related_name='intendant_checkouts',blank=True, null=True, on_delete=models.CASCADE)
    date_created = models.DateTimeField(verbose_name=_('Date created'),default=timezone.now)
    data_accomplished = models.DateTimeField(verbose_name=_('Accomplished date'), blank=True, null=True)
    amount = models.DecimalField(verbose_name=_('Amount'),max_digits=15,decimal_places=0,default=0, blank=True, null=True)
    state = models.CharField(verbose_name=_('state'),choices=STATES,default='pending',max_length=20)
    status = models.CharField(verbose_name=_('status'),max_length=500, null=True, blank=True)
    fee_amount = models.DecimalField(verbose_name=_('Fee amount'),decimal_places=0,max_digits=15, default=0)
    fee_percent = models.PositiveBigIntegerField(verbose_name=_('fee percent'), validators=
                                                 [MinValueValidator(0),
                                                 MaxValueValidator(100)], default=0)
    final_amount = models.DecimalField(verbose_name=_('Final Amount'), max_digits=15, decimal_places=0, default=0)
    
    def save(self,*arg, **kwargs):
        fee = self.applicant.fee
        promo = self.applicant.fee_promotions.last()
        if promo and promo.is_valid():
            fee = promo.fee
        self.fee_percent = fee
        self.fee_amount = math.floor((fee / 100) * float(self.amount))
        self.final_amount = self.amount - self.fee_amount
        super().save(*arg, **kwargs)
        
    class Meta:
        verbose_name = _('Checkout Request')
        verbose_name_plural = _('Checkout Requests')
    
    def __str__(self) -> str:
        return 'Checkout Request Number: ' + str(self.id)
    
    def accept(self,intendant:User):
        if not self.state == self.PENDING:
            return;
        self.state = self.ACCEPTED
        #-------- othr actions------
        self.intendant = intendant #who verify this transaction
        self.applicant.account.withdraw(self.amount)
        self.data_accomplished = timezone.now()
        self.save()
    
    def reject(self,status=None):
        if not self.state == self.PENDING:
            return
        self.state = self.REJECTED 
        self.save()




class TransferTransaction(models.Model):
    PENDING = 'pending'
    COMMITTED = 'committed'
    ROLLBACKED = 'rollbacked'
    REJECTED = 'rejected'
    STATES = [
        (PENDING,_('prepared')),
        (COMMITTED, _('committed')),
        (ROLLBACKED, _('rollbacked')),
        (REJECTED, _('rejected'))
    ]
    debtor = models.ForeignKey(verbose_name=_('debtor'),to=Account,on_delete=models.CASCADE, related_name='debts')
    creditor = models.ForeignKey(verbose_name=_('creditor'),to=Account,on_delete=models.CASCADE, related_name='credits')
    date_created = models.DateTimeField(verbose_name=_('Date created'),auto_now_add=True)
    data_accomplished = models.DateTimeField(verbose_name=('Accomplished date'),default=timezone.now)
    amount = models.DecimalField(verbose_name=_('Amount'),max_digits=15, decimal_places=0)
    state = models.CharField(verbose_name=_('State'),choices=STATES, default='pending',max_length=20)

    class Meta:
        verbose_name = _('Transfer Transaction')
        verbose_name_plural = _('Transfer Tranactions')
    

    def commit(self):
        if self.state == self.PENDING:
            self.creditor.deposit(self.amount)
            self.state = self.COMMITTED
            self.save()
      
    @classmethod
    def when_created(cls, sender, instance, created, *args, **kwargs):
        if created:
            instance.debtor.withdraw(instance.amount)
            instance.save()  
    
    def reject(self):
        if self.state == self.PENDING:
            self.debtor.deposit(self.amount)
            self.state == self.REJECTED
            self.save()
    
    def rollback(self):
        if self.state == self.COMMITTED:
            self.debtor.deposit(self.amount)
            self.creditor.withdraw(self.amount)
            self.state = self.ROLLBACKED
            self.save()

    
  
    # def save(self, **kwargs) -> None:
    #     self.__prepare()
    #     return super().save(**kwargs)

post_save.connect(TransferTransaction.when_created, sender=TransferTransaction)

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
    
         


class FeePromo(models.Model):
    customer = models.ForeignKey(verbose_name=_('customer'),on_delete=models.CASCADE, to=User, related_name='fee_promotions')
    date_from = models.DateTimeField(verbose_name=('date from'))
    date_to = models.DateTimeField(verbose_name=_('date to'))
    fee = models.PositiveIntegerField(default=0, verbose_name=_('fee'),
                                      validators=[
                                          MaxValueValidator(100),
                                          MinValueValidator(100)
                                      ])

    def is_valid(self):
        dt = timezone.now()
        return (self.date_from <= dt <= self.date_to)


    
    
