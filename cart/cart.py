from math import prod
from shops.models import Product
from django.http import HttpRequest
from django.conf import settings
from coupons.models import Coupon

class Cart():
    
    def __init__(self,request:HttpRequest) -> None:
        self.session = request.session
        
        cart = self.session.get(settings.CART_SESSION_ID)
        if not cart:
            cart = self.session[settings.cART_SESSION_ID] = {} #initialize with empty
        self.cart = cart
        self.coupon_id = self.session.get('coupon_id')
        
    @property
    def coupon(self):
        if self.coupon_id:
            coupon = Coupon.objects.filte(id=self.coupon_id).first()
            return coupon
        return None
    
    @property
    def is_empty(self):
        return self.cart == {}

    def add(self,product_id, quantity):
        id = str(product_id)
        if id not in self.cart.keys():
            self.cart[id] = {
                'quantity': quantity
            }
        else:
            self.cart[id]['quantity'] = quantity
            
        self.save()
    
    def update(self, product_id, size, color):
        id = str(product_id)
        if id in self.cart.keys():
            self.cart[id]['color'] = color
            self.cart[id]['size'] = size
            self.save()
            
    def remove(self, product_id):
        id = str(product_id)
        if id in self.cart:
            del self.cart[id]
            self.save()
            return True
        return False
    
    
    def increment(self, product_id):
        id = str(product_id)
        if id in self.cart:
            self.cart[id]['quantity'] +=1
            self.save()
            return True
        return False
        
    
    def decrement(self, product_id):
        id = str(product_id)
        if id in self.cart:
            if self.cart[id]['quantity'] > 1:
                self.cart[id]['quantity'] -=1
                return True
        return False

    def clear(self):
        del self.session[settings.CART_SESSION_ID]
        self.save()
    
    def get_total_price(self):
        total = 0
        products = Product.objects.filter(ids=self.cart.keys())
        for product in products:
            total += self.__get_total_price_per_item(product)
        coupon = self.coupon
        if coupon:
            if coupon.is_valid():
                total = self.coupon.get_price_after_applying_coupon(total)
        return total
    
    def __get_total_price_per_item(self, product:Product):
        quantity = self.cart[str(product.id)]
        price = product.price
        discount = product.discounts.latest()
        if discount:
            if discount.is_valid():
              price -= discount.get_discounted_price()
              
        return price * int(quantity)
    
    def apply_coupon(self, coupon:Coupon):
        if not self.coupon_id:
            self.session['coupon_id'] = coupon.id
            self.coupon_id = coupon.id
            self.save()
    
    def checkout(self):
        self.coupon.make_used()
        del self.session['coupon_id']
        self.clear()
        self.save()
    
    
    def save(self):
        self.session.modified = True
        
    def __iter__(self):
        product_ids = self.cart.keys()
        products = Product.objects.filter(id_in =product_ids)
        cart = self.cart.copy()
        for product in products:
            id = str(product.id)
            cart[id]['product'] = product
            cart[id]['price'] = product.price
            cart[id]['discounted_price'] = self.__get_total_price_per_item(product)
            cart[id]['total'] = cart[id]['discounted_price'] * int(cart[id]['quantity'])
            yield cart[id]
    
    def __len__(self):
        return sum(item['quantity'] for item in self.cart.values())


  # def add(self, product:Product, quantity:int = 1) -> None:
    #     id = str(product.id)
    #     price = product.price
    #     discount = product.discounts.latest()
    #     has_discount = 'False'
    #     discounted_price = price
    #     if discount.is_valid():
    #         discounted_price = discount.get_discounted_price()
    #         has_discount = 'True'
    #     if id not in self.cart:
    #         self.cart[id] = {
    #             'quantity': quantity,
    #             'price': price, 
    #             'has_discount': has_discount,
    #             'discounted_price': discounted_price
    #         }
    #         return True 
    #     return False
        