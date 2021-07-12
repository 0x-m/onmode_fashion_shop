
from django.db import models
from django.core.validators import MaxLengthValidator, MaxValueValidator, MinValueValidator, RegexValidator
from django.urls import utils

from django.utils import timezone
from users.models import User, Address
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from product_attributes.models import Size, Color
from django.urls import reverse

import os

class Shop(models.Model):
    
    def generate_path(instance, filename):
        path = 'shops/photos' + str(instance.id) + '/'
        return os.path.join(path,filename)
    
    seller = models.ForeignKey(verbose_name=_('Seller'),to=User,on_delete=models.CASCADE, related_name='shop')
    name = models.CharField(verbose_name=_('Name'),max_length=40,blank=True,unique=True)
    title = models.CharField(verbose_name=_('title'), max_length=100,null=True,blank=True)
    shop_phone = models.CharField(verbose_name=_('cell phone'),max_length=20,null=True, blank=True,
                                  validators=[
                                      RegexValidator('^[0-9]*$')
                                  ])
    description = models.CharField(verbose_name=_('Description'),max_length=2000,blank=True)
    address = models.CharField(verbose_name=_('Address'),max_length=500,blank=True)
    logo = models.ImageField(verbose_name=_('Logo'), null=True, blank=True,upload_to=generate_path)
    banner = models.ImageField(verbose_name=_('Banner'),blank=True, null=True,upload_to=generate_path)
    is_active = models.BooleanField(default=True,verbose_name=_('active'))
    date_created = models.DateTimeField(verbose_name=_('Date created'),default=timezone.now)
    post_destinatinos = models.CharField(verbose_name=_('Postal Destinations'),max_length=1000,null=True)
    
    
    
    
    class Meta:
        verbose_name = _('Shop')
        verbose_name_plural = _('Shops')

    def __str__(self) -> str:
        return self.name
        
    def get_absolute_url(self):
        return reverse('shops:shop', kwargs={'shop_name':self.name})
    
   
    
    def num_of_products(self):
        return len(self.products)
    
    def num_of_customers(self):
        return len(self.orders.all().distinct('user'))
        


class Brand(models.Model):
    name = models.CharField(verbose_name=_('Name'),max_length=40, unique=True)
    slug = models.SlugField()
    logo = models.ImageField(verbose_name=_('Logo'),null=True, blank=True)
    is_active = models.BooleanField(verbose_name=_('Active'),default=True)
    
        
    class Meta:
        verbose_name = _('Brand')
        verbose_name_plural = _('Brands')

    
    def __str__(self) -> str:
        return self.name

#such as men, women, kids,...
class Category(models.Model):
    name = models.CharField(verbose_name=_('Name'),max_length=40,unique=True)
    description = models.CharField(verbose_name=_('Description'),max_length=500, null=True)
    slug = models.SlugField()
    is_active = models.BooleanField(verbose_name=_('Active'),default=True)
    image = models.ImageField(verbose_name=_('Image'),null=True,blank=True)

        
    class Meta:
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')

    def __str__(self) -> str:
        return self.name
    
#product type: shoes, bag, cloth,...
class Type(models.Model):
    categories = models.ManyToManyField(verbose_name=_('Categories'),to=Category,related_name='types')
    name = models.CharField(verbose_name=_('Name'),max_length=50,blank=True, unique=True)
    description = models.CharField(verbose_name=_('Description'),max_length=500,null=True, blank=True)
    is_active = models.BooleanField(verbose_name=_('Active'),default=True)
    atrrs = models.JSONField(verbose_name=_('Attributes'),null=True, blank=True)


    class Meta:
        verbose_name = _('Type')
        verbose_name_plural = _('Types')

    # def __str__(self) -> str:
    #     return str(self.name)
    
#product subtype: sport shoes, classic bag,...
class SubType(models.Model):
    type = models.ForeignKey(verbose_name=_('Type'),to=Type,on_delete=models.CASCADE, related_name='subtypes')
    name = models.CharField(verbose_name=_('Name'),max_length=50)
        
    class Meta:
        verbose_name = _('SubType')
        verbose_name_plural = _('SubTypes')

    def __str__(self) -> str:
        return self.name



class Product(models.Model):
    shop = models.ForeignKey(verbose_name=_('Shop'),to=Shop, on_delete=models.CASCADE)
    brand = models.ForeignKey(verbose_name=_('Brand'),to=Brand, on_delete=models.CASCADE)
    categories = models.ManyToManyField(verbose_name=_('Categories'),to=Category,related_name='products')
    type = models.ForeignKey(verbose_name=_('Type'),to=Type,on_delete=models.CASCADE)
    subtype = models.ForeignKey(verbose_name=_('SubType'),to=SubType,on_delete=models.CASCADE, related_name='products')
    colors = models.ManyToManyField(verbose_name=_('Colors'),to=Color,related_name='products')
    sizes = models.ManyToManyField(verbose_name=_('Sizes'),to=Size,related_name='products')
    name = models.CharField(verbose_name=_('Name'),max_length=120)
    description = models.CharField(verbose_name=_('Description'),max_length=500)
    price = models.DecimalField(verbose_name=_('Price'),max_digits=10,decimal_places=0,validators=[
        MinValueValidator(1000),
    ])
    is_available = models.BooleanField(verbose_name=_('Available'),default=True)
    date_created = models.DateTimeField(verbose_name=_('Date created'),default=timezone.now)
    last_update = models.DateTimeField(auto_now=True,null=True)
    quantity = models.PositiveIntegerField(verbose_name=_('Quantity'),default=0)
    keywords = models.CharField(verbose_name=_('Keywords'),max_length=2000,null=True)
    image = models.ImageField(verbose_name=_('Image'), null=True, blank=True)
    attrs = models.JSONField(null=True)
    is_active = models.BooleanField(default=True)
    
        
    def get_absolute_url(self):
        return reverse('shops:detail', kwargs={'product_id':self.id})
    
    class Meta:
        verbose_name = _('Product')
        verbose_name_plural = _('Products')
    
    def default_keywords(self):
        self.keywords += ''
    
    def save(self,*args, **kwargs):
        self.default_keywords();
        super().save(*args, **kwargs)
        
    def add_keywords(self, keywords:list):
        for k in keywords:
            self.keywords += ',' + k
        self.save()
    
    def __str__(self) -> str:
        return self.name
    
    def is_available(self):
        return (self.quantity > 0) and (self.is_active)
    
    
class ProductImage(models.Model):
    product = models.ForeignKey(to=Product, on_delete=models.CASCADE,related_name='images')
    def generate_path(instance, filename):
        path = 'photos/' + str(instance.product.id) + '/'
        return os.path.join(path,filename)
    image = models.ImageField(upload_to = generate_path)

