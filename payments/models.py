from django.db import models
from users.models import User
from django.utils.translation import gettext_lazy as _

class PaymentTransaction(models.Model):
    CHECKOUT = 0
    DEPOSIT = 1
    TYPES = {
        (CHECKOUT, 'checkout'),
        (DEPOSIT, 'deposit')
    }
    user = models.ForeignKey(verbose_name=_('User'),to=User,on_delete=models.CASCADE,related_name='transactions')
    ref_id = models.CharField(verbose_name=_('ref ID'),max_length=50)
    code = models.CharField(verbose_name=_('Code'),max_length=50)
    description = models.TextField(verbose_name=_('Description'),max_length=500)
    authoriy = models.CharField(verbose_name=_('Authority'),max_length=50)
    type = models.IntegerField(verbose_name=_('type'), choices=TYPES, default=0)
    
    class Meta:
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')
