from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models.base import ModelState
from django.utils import timezone
import math
from shops.models import  Product
from django.utils.translation import gettext_lazy as _
import decimal

class Discount(models.Model):
    product = models.ForeignKey(verbose_name=_('Product'),to=Product, on_delete=models.CASCADE,related_name='discounts')
    percent = models.PositiveIntegerField(verbose_name=_('Percent %'))
    date_created = models.DateTimeField(verbose_name=_('Date created'),auto_now_add=True)
    date_from = models.DateTimeField(verbose_name=_('Date from'))
    date_to = models.DateTimeField(verbose_name=_('Date to'))
    quantity = models.PositiveIntegerField(verbose_name=_('Quantity'))
    is_active = models.BooleanField(verbose_name=_('Active'),default=True)
    
    class Meta:
        verbose_name = _('Discount')
        verbose_name_plural = _('Discounts')
    
    def __str__(self) -> str:
        return str(self.percent) + '%'
    
    def is_valid(self):
        dt = timezone.now()
        return ((self.date_from <= dt <= self.date_to) and 
                (self.is_active) and 
                (self.quantity > 0))
    
    def get_discounted_price(self):
        off = 0
        #if self.is_valid(): #dont check validity!....so its possible to use this function generally
        off =  self.product.price * decimal.Decimal(self.percent / 100.0)
        off = round(off)
        return self.product.price - off
    
    def decrement_quantity(self, n):
        if self.quantity >= n:
            self.quantity -=n
            self.product.quantity -=n
            self.product.save()
        else:
            self.quantity = 0
        self.save()

    

