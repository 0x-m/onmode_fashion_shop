from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class ProductAttributesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'product_attributes'
    verbose_name = _('Product attributes')