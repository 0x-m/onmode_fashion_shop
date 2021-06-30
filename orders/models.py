from functools import total_ordering
from math import prod
from typing import Iterable, Optional
from django.core.validators import MaxLengthValidator
from django.db import models
from django.db.models.signals import ModelSignal
from django.forms.models import modelformset_factory
from django.utils import timezone
from accounts.models import TransferTransaction
from shops.models import Color, Shop, Product,Size
from coupons.models import Coupon
from discounts.models import Discount
from django.utils import timezone
from django.db.models.signals import post_save
from users.models import Address, User

class OrderAddress(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone_no = models.CharField(max_length=11)
    state = models.CharField(max_length=50)
    city = models.CharField(max_length=50)
    town = models.CharField(max_length=50)
    posta_code = models.CharField(max_length=50)
    description = models.CharField(max_length=500)


class OrderList(models.Model):
    ULTIMATE = 'ultimate'
    EXPRESS = 'express'
    NORMAL = 'normal'
    LOCAL = 'local'
    POST_METHODS = [
        (ULTIMATE,'ultimate'),
        (EXPRESS, 'express'),
        (NORMAL, 'normal'),
    ]
    user = models.ForeignKey(to=User,on_delete=models.DO_NOTHING,related_name='order_lists')
    date_created = models.DateTimeField(default=timezone.now)
    total_price = models.DecimalField(max_digits=10,decimal_places=0,default=0)
    total_price_after_discount = models.DecimalField(max_digits=10,decimal_places=0,default=0)
    total_price_after_applying_coupon = models.DecimalField(max_digits=10, decimal_places=0,default=0)
    coupon = models.ForeignKey(to=Coupon,on_delete=models.SET_NULL, null=True) 
    is_paid = models.BooleanField(default=False)
    Address = models.ForeignKey(to=OrderAddress,on_delete=models.CASCADE, null=True)
    use_default_address = models.BooleanField(default=True)
    post_method = models.CharField(max_length=20,choices=POST_METHODS,default='ultimate')
    
    def set_coupon(self, coupon:Coupon):
        self.coupon = coupon
        self.save()

    
    def apply_coupon(self):
        if self.coupon:
            if self.coupon.is_valid():
                self.total_price_after_applying_coupon = self.coupon.get_total_price_after_applying_coupon(self.total_price_after_discount)
               # self.coupon.make_used()
        else:
            self.total_price_after_applying_coupon = self.total_price_after_discount
        self.save()
    

    
    def finish(self):
        self.coupon.make_used()
        for o in self.orders:
            for i in o.items.all():
                i.decrement_discount_quantity()
            transaction = TransferTransaction(debtor=self.user, 
                                              creditor= o.shop.seller,
                                              amount=self.total_price_after_applying_coupon)
            transaction.save()
        self.is_paid = True
        self.save()

    def clearout_order(self,order):
        #the order should not be deleted from order list!
        if not order in self.orders.all():
            return;
        self.total_price -= order.total_price
        self.total_price_after_discount -= order.discounted_total_price
        self.save()
    
    def add_order(self, order):
        self.total_price += order.total_price
        self.total_price_after_discount += order.discounted_total_price
        self.apply_coupon() #contains save
  
    

class Order(models.Model):
    PENDING = 'pending'
    ACCEPTED = 'accept' #seller accept to post the product
    REJECTED = 'rejected'
    SENT = 'sent' #seller was posted the product 
    RECEIVED = 'received' #the product is rcevied by the custoemr
    CANCELLED  = 'cancelled' #customer cancelled toe order 
    RETURNED = 'returned' #customer issue an return request
    
    STATES = [
        (PENDING,'pending'),
        (ACCEPTED,'accept'),
        (REJECTED, 'rejected'),
        (SENT,'sent'),
        (RECEIVED,'recieved'),
        (CANCELLED,'cancelled'),
        (RETURNED,'returned'),
    ]
    
    order_list = models.ForeignKey(to=OrderList,on_delete=models.CASCADE,related_name='orders')
    date_created = models.DateTimeField(default=timezone.now)
    user = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name='orders')
    shop = models.ForeignKey(to=Shop,on_delete=models.DO_NOTHING, related_name='orders')
    total_price = models.DecimalField(max_digits=10,decimal_places=0,default=0)
    discounted_total_price = models.DecimalField(verbose_name='total',max_digits=10,decimal_places=0,default=0)
    tracking_code = models.CharField(max_length=30)
    state = models.CharField(choices=STATES,default='pending', max_length=20)
    verify_sent = models.BooleanField(default=False)
    
    
    def add_item(self,item):
        if not item in self.items.all():
            return
        self.order_list.clearout_order(self)
        self.total_price += item.total_price
        self.discounted_total_price += item.discounted_total_price
        self.order_list.add_order(self)
        self.save()
            
    def clearout_item(self,item):
        if not item in self.items.all():
            return
        self.order_list.clearout_order(self)
        self.total_price -= item.total_price
        self.discounted_total_price -= item.discounted_total_price
        self.order_list.add_order(self)
        self.save()
    
    def set_discounted_total_price(self):
        if self.items:
            self.discounted_total_price = sum(item.discounted_total_price for item in self.items.all())
    

            
        
    def accept(self): #seller accept 
        self.state = self.ACCEPT
        #----------- create account trasaction------------
        self.save()
    
    def sent(self, tracking_code):
        #validating code--------------
        self.state = self.SENT
        self.save()
        pass

    def receive(self):
        self.state = self.RECEIVED
        #------------ apply accounttransaction-----------------
        self.save()
    
    def cancell(self):
        self.state = self.CANCELLED
        #-----------reverse apply accounttrasaction-------------
        self.save()
    
    def issue_return(self):
        pass
        

class OrderItem(models.Model):
    order = models.ForeignKey(to=Order,on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(to=Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10,decimal_places=0,default=0) #price of product
    color = models.ForeignKey(to=Color,on_delete=models.DO_NOTHING, null=True)
    size = models.ForeignKey(to=Size,on_delete=models.DO_NOTHING, null=True)
    has_discount = models.BooleanField(default=False)
    discounted_price = models.DecimalField(max_digits=10,decimal_places=0,default=0) #discounted price
    total_price = models.DecimalField(max_digits=10,decimal_places=0,default=0) # price * quantity
    discounted_total_price = models.DecimalField(max_digits=10,decimal_places=0,default=0)
    discount = models.ForeignKey(to=Discount,on_delete=models.DO_NOTHING,null=True)
    
    def __set_price(self):
        self.price = self.product.price
        self.total_price = self.price * self.quantity

    def __apply_discount(self):
        dt = timezone.now()
        discount = Discount.objects.filter(product=self.product,
                                      date_from__lte=dt,
                                      date_to__gte=dt).last(); #get the latest discount!
        if discount:
            self.has_discount = True
            self.discount = discount
            self.discounted_price = self.price - discount.get_discounted_price()
            
            if discount.quantity >= self.quantity:
                self.discounted_total_price = self.discounted_price * self.quantity
            else:
                self.discounted_total_price = self.discounted_price * discount.quantity + self.price * (self.quantity - discount.quantity)
        else:
            self.has_discount = False
            self.discount = None
            self.total_price = self.price * self.quantity
            self.discounted_price = self.price
            self.discounted_total_price = self.total_price
    

    @classmethod
    def post_create(cls, sender, instance, created, *args, **kwargs ):
        if created:
            print('orderitem created')
            instance.__set_price()
            instance.__apply_discount()
            instance.order.add_item(instance)
        else:
            instance.order.clearout_item(instance)
            instance.order.add_item(instance)
        instance.save()
    
    def decrement_quantity(self):
        if self.discount:
            self.discount.decrement_quantity(self.quantity)
        else:
            self.product.decrement_quantity(self.quantity)
    

    
post_save.connect(OrderItem.post_create, sender = OrderItem)

    
   
