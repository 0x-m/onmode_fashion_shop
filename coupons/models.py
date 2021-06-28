from django.db import models
from django.utils import timezone
from shops.models import Product
import secrets
from django.db.models.signals import post_save


class Coupon(models.Model):
    PERCENT = 'percent'
    AMOUNT = 'amount'

    TYPES = [
        (PERCENT,'percent'),
        (AMOUNT,'amount')
    ]
    code = models.CharField(max_length=15,null=True, blank=True)
    date_from = models.DateTimeField()
    date_to = models.DateTimeField()
    type = models.CharField(max_length=20,choices=TYPES)
    percent = models.PositiveIntegerField()
    amount = models.PositiveIntegerField()
    max_allowed_discount = models.PositiveBigIntegerField()
    is_active = models.BooleanField(default=True)
    is_used = models.BooleanField(default=False)


    @classmethod
    def post_create(cls, sender, instance, created, *args, **kwargs): 
        if created:
            id_string = str(instance.id)
            alphabet = 'ABCDEFGHIJKLmNOPQRSTWXYZabcdefghijklmnopqrstuwxyz0123456789'
            code = ''.join(secrets.choice(alphabet) for i in range(7))
            instance.code = code + id_string
            instance.save()
            
            
    def is_valid(self) -> bool:
        if self.is_active and not self.is_used:
            dt = timezone.now()
            if self.date_from < dt < self.date_to:
                return True
            
        return False
    
    def make_used(self) -> None:
        self.is_used = True
        self.is_active = False
        self.save()
    
    def get_price_after_applying_coupon(self,price:float):
        discount = 0
        if self.type == self.AMOUNT:
            discount = self.amount
            
        elif self.type == self.PERCENT:
            discount = price * (self.percent / 100.0)
            if discount > self.max_allowed_discount:
                discount = self.max_allowed_discount
            
        price_after_discount = price - discount
        if price_after_discount < 0:
            price_after_discount = 0
            
        return price_after_discount

post_save.connect(Coupon.post_create, sender=Coupon)