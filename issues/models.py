from django.db import models
from users.models import User
from orders.models import Order
class IssuesSubject(models.Model):
    subject = models.CharField(max_length=100)
    description = models.CharField(max_length=500)

class Issue(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE,related_name='issues')
    title = models.CharField(max_length=100)
    order = models.ForeignKey(to=Order,on_delete=models.CASCADE, related_name='issues', null=True)
    subject = models.ForeignKey(to=IssuesSubject,on_delete=models.CASCADE, related_name='issues')
    description = models.CharField(max_length=2000)
    state = models.CharField(max_length=20)
    status = models.CharField(max_length=5000)

    