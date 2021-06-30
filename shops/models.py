
from django.db import models
from django.core.validators import MaxLengthValidator, MaxValueValidator, MinValueValidator, slug_re
from django.db.models.signals import ModelSignal
from django.utils import tree
from django.utils import timezone
from users.models import User, Address
from django.utils import timezone

class Shop(models.Model):
    seller = models.ForeignKey(to=User,on_delete=models.CASCADE, related_name='shop')
    name = models.CharField(max_length=40,blank=True,unique=True)
    description = models.CharField(max_length=500,blank=True)
    address = models.CharField(max_length=500,blank=True)
    logo = models.ImageField()
    banner = models.ImageField()
    is_active = models.BooleanField(default=True)
    fee = models.PositiveBigIntegerField(verbose_name='fee %',validators=[
        MaxValueValidator(100),
        MinValueValidator(0)
    ])
    
    date_created = models.DateTimeField(default=timezone.now)
    post_destinatinos = models.JSONField(null=True)
    
    def __str__(self) -> str:
        return self.name

class Appeal(models.Model):
    PENDING = 'pending'
    ACCEPTED = 'approved'
    REJECTED = 'rejected'
    STATES = [
        (PENDING,'pending'),
        (ACCEPTED,'accepted'),
        (REJECTED,'rejected')
    ]
    user = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name='appeal')
    page_name = models.CharField(max_length=30)
    description = models.CharField(max_length=500)
    date_created = models.DateTimeField(default=timezone.now)
    state = models.CharField(choices=STATES,default='pending',max_length=20)
    status = models.CharField(max_length=500)
    
    def accept(self, msg= ""):
        self.state = self.ACCEPTED
        shop = Shop(seller=self.user)
        shop.save()
        self.state = msg
        self.save()
        
    def reject(self, msg = ""):
        self.state = self.REJECTED
        self.status = msg
        self.save()
    

#-------------------------------------

class Brand(models.Model):
    name = models.CharField(max_length=40, unique=True)
    slug = models.SlugField()
    logo = models.ImageField()
    is_active = models.BooleanField(default=True)

#such as men, women, kids,...
class Category(models.Model):
    name = models.CharField(max_length=40,unique=True)
    description = models.CharField(max_length=500, null=True)
    slug = models.SlugField()
    is_active = models.BooleanField(default=True)
    image = models.ImageField()

#product type: shoes, bag, cloth,...
class Type(models.Model):
    categories = models.ManyToManyField(Category,related_name='types')
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=500, null=True)
    is_active = models.BooleanField(default=True)
    atrrs = models.JSONField(null=True)

    def __str__(self) -> str:
        return self.name
    
#product subtype: sport shoes, classic bag,...
class SubType(models.Model):
    type = models.ForeignKey(Type,on_delete=models.CASCADE, related_name='subtypes')
    name = models.CharField(max_length=50)
    
    def __str__(self) -> str:
        return self.name

class Color(models.Model):
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=9)

class Size(models.Model):
    code = models.CharField(max_length=12, null=True, blank=True)
    description = models.CharField(max_length=20, null=True, blank=True)

class Product(models.Model):
    shop = models.ForeignKey(to=Shop, on_delete=models.CASCADE)
    brand = models.ForeignKey(to=Brand, on_delete=models.CASCADE)
    categories = models.ManyToManyField(to=Category,related_name='products')
    type = models.ForeignKey(to=Type,on_delete=models.CASCADE)
    subtype = models.ForeignKey(to=SubType,on_delete=models.CASCADE, related_name='products')
    colors = models.ManyToManyField(to=Color,related_name='products')
    sizes = models.ManyToManyField(to=Size,related_name='products')
    name = models.CharField(max_length=120)
    description = models.CharField(max_length=500)
    price = models.DecimalField(max_digits=10,decimal_places=3)
    is_available = models.BooleanField(default=True)
    date_created = models.DateTimeField(default=timezone.now)
    last_update = models.DateTimeField(auto_now=True,null=True)
    quantity = models.PositiveIntegerField(default=0)
    keywords = models.CharField(max_length=2000,null=True)
    image = models.ImageField()
    
    def default_keywords(self):
        self.keywords += ''
    
    def save(self,*args, **kwargs):
        self.default_keywords();
        super().save(*args, **kwargs)
        
    def add_keywords(self, keywords:list):
        for k in keywords:
            self.keywords += ',' + k
        self.save()
    
    
    
class ProductImage(models.Model):
    product = models.ForeignKey(to=Product, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='media/img')


class Collection(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=500)
    is_active = models.BooleanField(default=True)
    slug = models.SlugField()

    def __str__(self) -> str:
        return self.name
    
class CollectionItem(models.Model):
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, related_name='items')
    Product = models.ForeignKey(Product,on_delete=models.CASCADE)
    

    
