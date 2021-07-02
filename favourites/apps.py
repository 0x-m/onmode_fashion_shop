from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class FavouritesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'favourites'
    verbose_name = _('Favourites')
