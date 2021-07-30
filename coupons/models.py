import decimal
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone
from shops.models import Product
import secrets
from django.db.models.signals import post_save
from django.utils.translation import gettext_lazy as _


class Coupon(models.Model):
    PERCENT = 'percent'
    AMOUNT = 'amount'

    TYPES = [
        (PERCENT,_('percent')),
        (AMOUNT,_('amount'))
    ]
    code = models.CharField(verbose_name=_('Code'),max_length=15,null=True, blank=True)
    date_from = models.DateTimeField(verbose_name=_('Date from'))
    date_to = models.DateTimeField(verbose_name=_('Date to'),)
    type = models.CharField(verbose_name=_('Coupon type'),max_length=20,choices=TYPES)
    percent = models.PositiveIntegerField(verbose_name=_('Percent %'),validators=[
        MinValueValidator(0),
        MaxValueValidator(100)
    ])
    
    amount = models.DecimalField(verbose_name=_('Amount'),max_digits=10,decimal_places=0,default=0)
    max_allowed_discount = models.DecimalField(verbose_name=_('MAx Allowed Discount'),max_digits=10,
                                               decimal_places=0,default=0)
                                               
    is_active = models.BooleanField(verbose_name=_('Active'),default=True)
    is_used = models.BooleanField(verbose_name=_('Used'),default=False)

    class Meta:
        verbose_name = _('Coupon')
        verbose_name_plural = _('Coupons')

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
    
    def get_price_after_applying_coupon(self,price:decimal):
        discount = 0
        if self.type == self.AMOUNT:
            discount = self.amount
            
        elif self.type == self.PERCENT:
            discount = price * decimal.Decimal(self.percent / 100.0)
            discount = round(discount)
            
            if discount > self.max_allowed_discount:
                discount = self.max_allowed_discount
            
        price_after_discount = price - discount
        if price_after_discount < 0:
            price_after_discount = 0
            
        return price_after_discount
    
    def __str__(self) -> str:
        if self.type == self.PERCENT:
            return self.PERCENT + ":" + str(self.percent)
        return self.AMOUNT + ":" + self.amount

post_save.connect(Coupon.post_create, sender=Coupon)