from io import DEFAULT_BUFFER_SIZE
from django.db import models
from django.db.models.base import ModelState
from django.utils.translation import gettext_lazy as _
from users.models import User
from django.utils import timezone

class AdminMessage(models.Model):
    SUCCESS = 0
    WARNING = 1
    ERROR = 2
    INFO = 3
    LEVELS = [
        (SUCCESS, _('Success')),
        (WARNING, _('Warning')),
        (ERROR, _('Error')),
        (INFO, _('Info'))
    ]
    
    sender = models.ForeignKey(verbose_name=_('Sender'),to=User,on_delete=models.CASCADE, related_name='sent_messages')
    reciever = models.ForeignKey(verbose_name=_('Reciever'),to=User,on_delete=models.CASCADE, related_name='recieved_messages')
    level = models.PositiveIntegerField(verbose_name=_('Level'),choices=LEVELS)
    title = models.CharField(verbose_name=_('Title'),max_length=100,blank=True)
    body = models.CharField(verbose_name=_('Body'),max_length=5000, blank=True)
    date_created = models.DateTimeField(default=timezone.now)
    class Meta:
        verbose_name = 'Admin message'
        verbose_name_plural = 'Admin messages'
        
