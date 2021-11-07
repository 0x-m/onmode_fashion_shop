from django.db import models
from django.utils.translation import gettext_lazy as _


class Color(models.Model):
    name = models.CharField(verbose_name=_('Name'),max_length=50)
    code = models.CharField(verbose_name=_('Color code'),max_length=9)
    
    class Meta:
        verbose_name = _('Color')
        verbose_name_plural = _('Colors')


    def __str__(self) -> str:
        return self.name

class Size(models.Model):
    code = models.CharField(verbose_name=_('Size code'),max_length=12, null=True, blank=True)
    class Meta:
        verbose_name = _('Size')
        verbose_name_plural = _('Sizes')

    def __str__(self) -> str:
        
        return self.code