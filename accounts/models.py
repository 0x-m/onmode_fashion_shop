from typing import Iterable, Optional
from django.db import models
from users.models import User

class Account(models.Model):
    user = models.OneToOneField(to=User,on_delete=models.CASCADE,related_name='account')
    balance = models.DecimalField(max_digits=15,decimal_places=0)
    last_updated = models.DateTimeField(auto_now=True)
    
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
        (PENDING,'pending'),
        (ACCEPTED,'accepted'),
        (REJECTED, 'rejected')
    ]
    
    account = models.ForeignKey(to=Account,on_delete=models.CASCADE,related_name='checkouts')
    date_created = models.DateField(auto_now=True)
    amount = models.DecimalField(max_digits=15,decimal_places=0)
    description = models.TextField(max_length=500,null=True)
    state = models.CharField(choices=STATES,default='pending',max_length=20)
    status = models.TextField(max_length=500, null=True)
    
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
        (PENDING,'prepared'),
        (COMMITTED, 'committed'),
        (ROLLBACKED, 'rollbacked')
    ]
    
    debtor = models.ForeignKey(to=Account,on_delete=models.CASCADE, related_name='debts')
    creditor = models.ForeignKey(to=Account,on_delete=models.CASCADE, related_name='credits')
    date_created = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=15, decimal_places=0)
    state = models.CharField(choices=STATES, default='pending',max_length=20)
    
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
        (COMMITTED, 'committed'),
        (PENDING, 'pending')
    ]
    account = models.ForeignKey(to=Account,on_delete=models.CASCADE, related_name='deposits')
    amount = models.PositiveIntegerField()
    date_created = models.DateTimeField(auto_now_add=True)
    state = models.CharField(max_length=20,choices=STATES,default='pending')
    
    def apply(self):
        if not self.state == self.COMMITTED:
            self.account.deposit(self.amount)
            self.state = self.COMMITTED
            self.save()
    
         


    


