from .cart import Cart
from django.test import TestCase
from users.models import User
from shops.models import Product
from product_attributes.models import Size,Color
from django.conf import settings
class TestCart(TestCase):
    
    # fixtures = ['user.json','category.json', 'type.json', 'subtype.json','brand.json', 'color.json', 'size.json','shop.json', 'product.json']
    # @classmethod
    # def setUpTestData(cls) -> None:
    #     cls.user = User.objects.create(phone_no='09179175555')
    #     cls.user.set_password('123')
    #     return super().setUpTestData()
    
    # def test_add_to_cart(self):
    #     cart = Cart(self.client)
    #     cart.add(1)
    #     c = self.client.session.get(settings.CART_SESSION_ID)
    #     self.assertIsNotNone(c)
        
        
    
    # def test_remove_from_cart(self):
    #     pass
    
    # def test_change_color(self):
    #     pass
    
    # def test_change_size(self):
    #     pass
    
    # def test_cart_list(self):
    #     pass
    
    # def test_add_duplicate_product(self):
    #     pass
    
    # def test_total_price_after_remove_product(self):
    #     pass
    
    