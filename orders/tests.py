from datetime import time, timedelta
from functools import total_ordering
from discounts.models import Discount
from shops.models import Product, Shop
from orders.models import Order, OrderItem, OrderList
from users.models import User
from django.test import TestCase
from django.utils import timezone

class TestOrdering(TestCase):
    
    #fixtures = ['user.json','shop.json','category.json','color.json','type.json','subtype.json','product.json','order_list.json','order.json','order_item.json']
    
    @classmethod
    def setUpTestData(cls) -> None:
        cls.user = User(phone_no='09179827587')
        cls.user.save()
        cls.shop = Shop(seller=cls.user)
        cls.shop.save()
        
        cls.order_list = OrderList(user=cls.user)
        cls.order_list.save()
        return super().setUpTestData()
    
    

    def test_add_order_item(self):
        self.client.force_login(self.user)
        o = Order(user=self.user,order_list=self.order_list,shop=self.shop)
        o.save()
        price = 1550
        quantity = 3
        total = price * quantity
        
        p1 = Product(shop=self.shop,price=price)
        p1.save()
        
        # percent = 12
        # df = timezone.now()
        # dt = timezone.now() + timedelta(days=1)
        # discount = Discount(perncent=percent,product=p1,date_from=df,date_to=dt)
        # discount.save()
        
        oi1 = OrderItem(order=o,product=p1,quantity=quantity)
        oi1.save()
        self.assertIsNotNone(o.items)
        self.assertEqual(oi1.total_price,total)
        self.assertEqual(oi1.discounted_total_price,total)
        self.assertEqual(oi1.discounted_total_price,total)
        self.assertEqual(o.total_price,total)
        self.assertEqual(o.discounted_total_price, total)
        
    
    def test_compute_price_with_discount(self):
        self.client.force_login(self.user)
        o = Order(user=self.user,order_list=self.order_list,shop=self.shop)
        o.save()
        price = 1550
        quantity = 3
        total = price * quantity
        
        p1 = Product(shop=self.shop,price=price)
        p1.save()
        
        #----------------------------------------------
        percent = 12
        df = timezone.now()
        dt = timezone.now() + timedelta(days=1)
        discount = Discount(percent=percent,product=p1,date_from=df,date_to=dt,quantity=100)
        discount.save()
        
        discounted_price = price * (1 - percent /100)
        discouned_total_price = quantity * discounted_price
        oi1 = OrderItem(order=o,product=p1,quantity=quantity)
        oi1.save()
        self.assertEqual(oi1.price, price)
        self.assertEqual(oi1.total_price,total)
        self.assertEqual(oi1.discounted_price, discounted_price)
        self.assertEqual(oi1.discounted_total_price,discouned_total_price)
        self.assertEqual(o.total_price,total)
        self.assertEqual(o.discounted_total_price, discouned_total_price)
        
        
    
    def test_many_order_items(self):
        self.client.force_login(self.user)
        o = Order(user=self.user,order_list=self.order_list,shop=self.shop)
        o.save()
        
        p1 = Product(shop=self.shop,price=1000)
        p1.save()
        
        p2 = Product(shop=self.shop,price = 1500)
        p2.save()
        
        p3 = Product(shop=self.shop,price = 2500)
        p3.save()

        oi1 = OrderItem(order=o,product=p1,quantity=2)
        oi2 = OrderItem(order=o,product=p2,quantity=3)
        oi3 = OrderItem(order=o,product=p3,quantity=4)
        oi1.save()
        oi2.save()
        oi3.save()
        
        total = 2*1000+3*1500+4*2500

        self.assertEqual(oi1.price, 1000)
        self.assertEqual(oi1.total_price,2*1000)
        self.assertEqual(oi1.discounted_price, 1000)
        self.assertEqual(oi1.discounted_total_price,2*1000)
        
        self.assertEqual(oi2.price, 1500)
        self.assertEqual(oi2.total_price,3*1500)
        self.assertEqual(oi2.discounted_price, 1500)
        self.assertEqual(oi2.discounted_total_price,3*1500)

        self.assertEqual(oi3.price, 2500)
        self.assertEqual(oi3.total_price,4*2500)
        self.assertEqual(oi3.discounted_price, 2500)
        self.assertEqual(oi3.discounted_total_price,4*2500)
        
        self.assertEqual(o.total_price,total)
        self.assertEqual(o.discounted_total_price, total)
        
        
    
    def test_many_order_items_with_discounts(self):
        self.client.force_login(self.user)
        o = Order(user=self.user,order_list=self.order_list,shop=self.shop)
        o.save()
        
        p1 = Product(shop=self.shop,price=1000)
        p1.save()
        
        p2 = Product(shop=self.shop,price = 1500)
        p2.save()
        
        percent = 11
        df = timezone.now()
        dt = timezone.now() + timedelta(days=1)
        discount = Discount(percent=percent,product=p2,date_from=df,date_to=dt,quantity=100)
        discount.save()

        
        p3 = Product(shop=self.shop,price = 2500)
        p3.save()

        oi1 = OrderItem(order=o,product=p1,quantity=2)
        oi2 = OrderItem(order=o,product=p2,quantity=3)
        oi3 = OrderItem(order=o,product=p3,quantity=4)
        oi1.save()
        oi2.save()
        oi3.save()
        
        total = 2*1000+3*1500+4*2500
        discounted_total = 2*1000+3*1500*(1-11/100)+4*2500

        self.assertEqual(oi1.price, 1000)
        self.assertEqual(oi1.total_price,2*1000)
        self.assertEqual(oi1.discounted_price, 1000)
        self.assertEqual(oi1.discounted_total_price,2*1000)
        
        self.assertEqual(oi2.price, 1500)
        self.assertEqual(oi2.total_price,3*1500)
        self.assertEqual(oi2.discounted_price, 1500*(1-11/100))
        self.assertEqual(oi2.discounted_total_price,3*1500*(1-11/100))

        self.assertEqual(oi3.price, 2500)
        self.assertEqual(oi3.total_price,4*2500)
        self.assertEqual(oi3.discounted_price, 2500)
        self.assertEqual(oi3.discounted_total_price,4*2500)
        
        self.assertEqual(o.total_price,total)
        self.assertEqual(o.discounted_total_price, discounted_total)
        self.assertEqual(self.order_list.total_price,o.total_price)
        self.assertEqual(self.order_list.total_price_after_discount,o.discounted_total_price)
        
        
    def test_more_than_one_order(self):
        self.client.force_login(self.user)
        o = Order(user=self.user,order_list=self.order_list,shop=self.shop)
        o.save()
        
        o2 = Order(user=self.user,order_list=self.order_list,shop=self.shop)
        o2.save()
        
        p1 = Product(shop=self.shop,price=1000)
        p1.save()
        
        p2 = Product(shop=self.shop,price = 1500)
        p2.save()
        
        percent = 11
        df = timezone.now()
        dt = timezone.now() + timedelta(days=1)
        discount = Discount(percent=percent,product=p2,date_from=df,date_to=dt,quantity=100)
        discount.save()
        percent = 15
        df = timezone.now()
        dt = timezone.now() + timedelta(days=1)
        discount1 = Discount(percent=percent,product=p1,date_from=df,date_to=dt,quantity=100)
        discount1.save()
        
        
        p3 = Product(shop=self.shop,price = 2500)
        p3.save()

        oi1 = OrderItem(order=o,product=p1,quantity=2)
        oi2 = OrderItem(order=o,product=p2,quantity=3)
        oi3 = OrderItem(order=o,product=p3,quantity=4)
        oi1.save()
        oi2.save()
        oi3.save()
        
        oi4 = OrderItem(order=o2,product=p1,quantity=1)
        oi5 = OrderItem(order=o2,product=p2,quantity=2)
        oi6 = OrderItem(order=o2,product=p3,quantity=5)
        oi4.save()
        oi5.save()
        oi6.save()
        
        total_1 = 2*1000+3*1500+4*2500 
        total_2 = 1000 + 2*1500 + 5*2500
        dis_1 = 2* discount1.get_discounted_price() + 3*discount.get_discounted_price() + 4*2500
        dis_2 = discount1.get_discounted_price() + 2*discount.get_discounted_price() + 5*2500
        
        total = total_1 + total_2
        discounted_total = 2*1000+3*1500*(1-11/100)+4*2500

        self.assertEqual(o.total_price,total_1)
        self.assertEqual(o.discounted_total_price, dis_1)
        self.assertEqual(o2.total_price,total_2)
        self.assertEqual(o2.discounted_total_price, dis_2)
        self.assertEqual(self.order_list.total_price, total_1 + total_2)
        self.assertEqual(self.order_list.total_price_after_discount, dis_1 + dis_2)
        
        
    
    
    # def test_add_order_item_with_discount(self):
    #     pass
    
    # def test_order_list_with_coupon(self):
    #     pass
    
    # def test_create_order(self):
    #     pass
    
    # def test_create_order_item(self):
    #     pass
    
    # def test_computing_price(self):
    #     pass
    
    # def test_compute_discounted_price(self):
    #     pass
    
    # def test_compute_price_after_applying_coupon(self):
    #     pass
    
    # def test_compute_discounted_price_after_appplying_coupon(self):
    #     pass
    
    # def test_add_orde_item_to_order(self):
    #     pass
    
    # def remove_order_item_from_order(self):
    #     pass
    
    # def remove_order_from_order_list(self):
    #     pass
    
    # def add_order_to_order_list(self):
    #     pass
    
    