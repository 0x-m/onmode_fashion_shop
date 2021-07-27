from django.core.validators import MaxLengthValidator
from django.db import models
from shops.models import Product
from users.models import User
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

class Comment(models.Model):
    
    product = models.ForeignKey(to=Product, on_delete=models.CASCADE,verbose_name=_('product'))
    user = models.ForeignKey(to=User,verbose_name=_('User'),on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    date_published = models.DateTimeField(default=timezone.now)
    body = models.CharField(max_length=5000)
    
    class Meta:
        verbose_name = _('Comment')
        verbose_name_plural = _('Comments')
        
    def __str__(self) -> str:
        return str(self.title)
    
