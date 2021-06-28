from django.db import models
from users.models import User

class PaymentTransaction(models.Model):
    user = models.ForeignKey(to=User,on_delete=models.CASCADE,related_name='transactions')
    ref_id = models.CharField(max_length=50)
    code = models.CharField(max_length=50)
    description = models.TextField(max_length=500)
    authoriy = models.CharField(max_length=50)
    