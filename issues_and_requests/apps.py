from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class IssuesAndRequestsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'issues_and_requests'
    verbose_name = _('Issues and requests')

