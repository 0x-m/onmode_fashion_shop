
from logging import setLogRecordFactory
from typing import AnyStr, Iterable, Optional
from django.db import models
from django.contrib.auth.models import AbstractUser,UserManager
from django.core.validators import MaxLengthValidator, MaxValueValidator, MinValueValidator, RegexValidator
from django.utils import tree
from django.db.models.signals import post_save
import secrets
from django.utils.translation import gettext_lazy as _

class CustomUserManager(UserManager):
    def create_superuser(self,phone_no,email, password: str):
      u = self.model(
          phone_no=phone_no,
          email=self.normalize_email(email))
      
      u.set_password(password)
      u.is_superuser = True
      u.is_staff = True
      u.save(using=self._db)
    


class User(AbstractUser):
    username = None
    email = models.EmailField(verbose_name=_('Email'),unique=True,null=True,blank=True)
    gender = models.CharField(verbose_name=_('Gender'),choices=[('male',_('male')),('female',_('female'))],max_length=10,default='male')
    phone_no = models.CharField(verbose_name=_('Phone Number'),max_length=11, 
                                validators=[
                                    RegexValidator('^09[0-9]{9}$'),
                                    ],unique=True)

    USERNAME_FIELD = 'phone_no'
    objects = CustomUserManager()
    merchan_card = models.CharField(verbose_name=_('Merchand Card'),max_length=16,blank=True, null=True)
    user_code = models.CharField(verbose_name=_('User Code'),max_length=20)
    points = models.PositiveIntegerField(verbose_name=_('Points'),default=0)
    fee = models.PositiveIntegerField(verbose_name=_('Fee'),validators=[
        MinValueValidator(0),
        MaxValueValidator(100)
    ], default=9)
    
    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('users')
    
    @classmethod
    def post_create(cls, sender, instance, created, *args, **kwargs):
        if created:
            id = str(instance.id)
            alphbet = 'ABCDEFGHIJKLmNOPQRSTWXYZabcdefghijklmnopqrstuwxyz0123456789'
            code = ''.join(secrets.choice(alphbet)for i in range(6))
            print(code + id)
            instance.user_code = code + id
            instance.save()
            

    @property
    def is_seller(self) -> bool:
        return self.shop.first() != None
    
    def increment_points(self):
        self.points +=1
        self.save()
   

class Address(models.Model):
    user = models.OneToOneField(verbose_name=_('User'),to=User,on_delete=models.CASCADE,related_name='address',null=True,blank=True)
    state = models.CharField(verbose_name=_('State'),max_length=40,blank=True,null=True)
    city = models.CharField(verbose_name=_('City'),max_length=40,blank=True,null=True)
    town = models.CharField(verbose_name=_('Town'),max_length=40,blank=True,null=True)
    postal_code = models.CharField(verbose_name=_('Postal Code'),max_length=20,blank=True,null=True)
    description = models.TextField(verbose_name=_('Description'),max_length=250,blank=True,null=True)
    
    class Meta:
        verbose_name = _('Address')
        verbose_name_plural = _('Addresses')
     
    def __check_for_nullity_and_blank(self, value):
        return (value != None) and (value != '')
    
    def is_complete(self):
        return (self.__check_for_nullity_and_blank(self.state) and
                self.__check_for_nullity_and_blank(self.city) and
                self.__check_for_nullity_and_blank(self.town) and
                self.__check_for_nullity_and_blank(self.postal_code) and
                self.__check_for_nullity_and_blank(self.description))
        
     
    def __str__(self) -> str:
        if self.user:
            return 'آدرس کاربر :%s' % self.user.phone_no
        else:
            return ''
    
post_save.connect(User.post_create, sender=User)
    
    

   
    
   
        
        
    
    
    
