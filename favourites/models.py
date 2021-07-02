from django.db import models
from django.db.models.signals import ModelSignal
from shops.models import Product
from users.models import User
from django.utils.translation import gettext_lazy as _

class Favourite(models.Model):
    user = models.ForeignKey(verbose_name=_('User'),to=User, on_delete=models.CASCADE, related_name='favourites')
    product = models.ForeignKey(verbose_name=_('Product'),to=Product,on_delete=models.CASCADE, related_name='favs')
    
    class Meta:
        verbose_name = _('Favourite')
        verbose_name_plural = _('Favourites')
        
    def __str__(self) -> str:
        return self.product.name