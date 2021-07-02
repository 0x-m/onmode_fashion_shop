from django.db import models
from shops.models import Product
from django.utils.translation import gettext_lazy as _



class Collection(models.Model):
    name = models.CharField(verbose_name=_('Name'),max_length=50, unique=True)
    description = models.CharField(verbose_name=_('Description'),max_length=500)
    is_active = models.BooleanField(verbose_name=_('Active'),default=True)
    slug = models.SlugField()

        
    class Meta:
        verbose_name = _('Collection')
        verbose_name_plural = _('Collections')


    def __str__(self) -> str:
        return self.name
    
class CollectionItem(models.Model):
    collection = models.ForeignKey(verbose_name=_('Collection'),to=Collection, on_delete=models.CASCADE, related_name='items')
    Product = models.ForeignKey(verbose_name=_('Product'),to=Product,on_delete=models.CASCADE)
        
    class Meta:
        verbose_name = _('Collection Item')
        verbose_name_plural = _('Collection Items')

    

    