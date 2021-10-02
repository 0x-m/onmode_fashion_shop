from django.db import models
from shops.models import Shop
from django.utils.translation import gettext_lazy as _
from users.models import User
from django.utils import timezone, tree
from orders.models import Order

class Appeal(models.Model):
    PENDING = 'pending'
    ACCEPTED = 'Accepted'
    REJECTED = 'rejected'
    STATES = [
        (PENDING,_('pending')),
        (ACCEPTED,_('accepted')),
        (REJECTED,_('rejected'))
    ]
    user = models.ForeignKey(verbose_name=_('User'),to=User, on_delete=models.CASCADE, related_name='appeal')
    page_name = models.CharField(verbose_name=_('Page Name'),max_length=30)
    description = models.CharField(verbose_name=_('Description'),null=True,blank=True,max_length=500)
    date_created = models.DateTimeField(verbose_name=_('Date created'),default=timezone.now)
    state = models.CharField(choices=STATES,default='pending',max_length=20)
    status = models.CharField(verbose_name=_('Status'),max_length=500,blank=True,null=True)
    
    def accept(self, msg= ""):
        self.state = self.ACCEPTED
        shop = Shop(seller=self.user,name=self.page_name)
        shop.save()
        self.status = msg
        self.save()
        
    def reject(self, msg = ""):
        self.state = self.REJECTED
        self.status = msg
        self.save()
    
    def __str__(self) -> str:
        return self.page_name
    
        
    class Meta:
        verbose_name = _('Appeal')
        verbose_name_plural = _('Appeals')


#-------------------------------------
class IssuesSubject(models.Model):
    subject = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    
    class Meta:
        verbose_name = _('Issue Subject')
        verbose_name_plural = _('Issue Subjects')

class Issue(models.Model):
    user = models.ForeignKey(verbose_name=_('User'),to=User, on_delete=models.CASCADE,related_name='issues')
    title = models.CharField(verbose_name=_('Title'),max_length=100, blank=True)
    subject = models.ForeignKey(verbose_name=_('Subject'),to=IssuesSubject,on_delete=models.CASCADE, related_name='issues')
    description = models.CharField(verbose_name=_('Description'),max_length=2000)
    response = models.CharField(verbose_name=_('Response'),max_length=5000, blank=True,null=True)
    class Meta:
        verbose_name = _('Issue')
        verbose_name_plural = _('Issues')

    