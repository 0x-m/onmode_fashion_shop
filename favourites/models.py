from django.db import models
from django.db.models.signals import ModelSignal
from shops.models import Product
from users.models import User

class Favourite(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name='favourites')
    product = models.ForeignKey(to=Product,on_delete=models.CASCADE, related_name='favs')
    