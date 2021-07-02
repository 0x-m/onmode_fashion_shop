from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class ProductCollectionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'product_collections'
    verbose_name = _('Collections')