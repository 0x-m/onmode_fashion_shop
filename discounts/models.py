from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models.base import ModelState
from django.utils import timezone
import math
from shops.models import Collection, Product


class Discount(models.Model):
    product = models.ForeignKey(to=Product, on_delete=models.CASCADE,related_name='discounts')
    percent = models.PositiveIntegerField()
    date_created = models.DateTimeField(auto_now_add=True)
    date_from = models.DateTimeField()
    date_to = models.DateTimeField()
    quantity = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    
    def is_valid(self):
        dt = timezone.now()
        return (self.date_from <= dt <= self.date_to) and (self.is_active) and (self.quantity > 0)
    
    def get_discounted_price(self):
        off = 0
        #if self.is_valid(): #dont check validity!....so its possible to use this function generally
        off =  self.product.price * (self.percent / 100.0)
        off = math.floor(off)
        return self.product.price - off
    
    def decrement_quantity(self, n):
        if self.quantity >= n:
            self.quantity -=n
        else:
            self.quantity = 0
        self.save()

    

