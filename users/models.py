
from logging import setLogRecordFactory
from typing import AnyStr, Iterable, Optional
from django.db import models
from django.contrib.auth.models import AbstractUser,UserManager
from django.core.validators import MaxLengthValidator, RegexValidator
from django.utils import tree
from django.db.models.signals import post_save
import secrets


class CustomUserManager(UserManager):
    def create_superuser(self,phone_no,email, password: str):
      u = self.model(
          phone_no=phone_no,
          email=self.normalize_email(email))
      
      u.set_password(password)
      u.is_superuser = True
      u.is_staff = True
      u.save(using=self._db)
    
    # def create_user(self, phone_no: str,email=None, password=None, **extra_fields):
    #     user = self.model(phone_no=phone_no)
    #     user.set_password(password)
    #     user.save(usin_db=self._db)
    #     return user
        


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True,null=True,blank=True)
    gender = models.CharField(choices=[('male','male'),('female','female')],max_length=10,default='male')
    phone_no = models.CharField(max_length=11, 
                                validators=[
                                    RegexValidator('^09[0-9]{9}$'),
                                    ],unique=True)

    USERNAME_FIELD = 'phone_no'
    objects = CustomUserManager()
    merchan_card = models.CharField(max_length=16, null=True)
    user_code = models.CharField(max_length=20)
    points = models.PositiveIntegerField(default=0)
    
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
        return self.shop == None
    
    def increment_points(self):
        self.points +=1
        self.save()
   

class Address(models.Model):
    user = models.OneToOneField(to=User,on_delete=models.CASCADE,related_name='address',null=True)
    state = models.CharField(max_length=40,blank=True)
    city = models.CharField(max_length=40,blank=True)
    town = models.CharField(max_length=40,blank=True)
    postal_code = models.CharField(max_length=20,blank=True)
    description = models.TextField(max_length=250,blank=True)
     
    
post_save.connect(User.post_create, sender=User)
    
    

   
    
   
        
        
    
    
    
