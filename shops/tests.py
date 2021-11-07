from django.http import request
from users.models import User
from django.shortcuts import redirect
from django.test import TestCase
from .models import Brand, Shop

# class TestMakeAppeal(TestCase):
    
#     @classmethod
#     def setUpTestData(cls) -> None:
#         cls.user = User.objects.create(phone_no='09179827587')
#         cls.user1 = User.objects.create(phone_no="09179887585")
        
#         return super().setUpTestData()
    
#     def test_GET_new_appeal_request_template(self):
#         self.client.force_login(self.user)
#         res = self.client.get('/shops/appeal/')
#         self.assertTemplateUsed(res, 'shop/request.html')
    
#     def test_GET_an_appeal_exists_appeal_template(self):
#         self.client.force_login(self.user)
#         res = self.client.post('/shops/appeal/', {
#             'page_name': 'my_page',
#             'description': 'aaa'
#         })
#         res = self.client.get('/shops/appeal/')
#         self.assertTemplateUsed(res, 'shop/appeal.html')
        
    
#     def test_make_new_appeal(self):
#         self.client.force_login(self.user)
#         res = self.client.post('/shops/appeal/',{
#             'page_name': 'my_page',
#             'description': '12dsfds'
#         })
      
#         self.assertContains(res, 'registered',status_code=200)
    
#     def test_make_redundant_appeal(self):
#         self.client.force_login(self.user)
#         res = self.client.post('/shops/appeal/',{
#             'page_name': 'my_page',
#             'description': '12dsfds'
#         })
#         res = self.client.post('/shops/appeal/',{
#             'page_name': 'my_page',
#             'description': '12dsfds'
#         })
#         self.assertTemplateUsed(res, 'shop/appeal.html')
    
#     def test_page_name_not_provided_400_code(self):
#         self.client.force_login(self.user)
#         res = self.client.post('/shops/appeal/')
#         self.assertContains(res, 'not provided',status_code=400)
    
#     def page_name_exists_400_Code(self):
#         self.client.force_login(self.user)
#         res = self.client.post('shops/appeal', {
#             'page_name': 'my_page'
#         })
#         self.client.force_login(self.user1)
#         res = self.client.post('shops/appeal',{
#             'page_name': 'my_page'
#         })
#         self.assertContains(res, 'exist', status_code=400)

class TestAddEdit(TestCase):
    fixtures = ['category.json','type.json','subtype.json','color.json','brand.json','size.json']
    
    @classmethod
    def setUpTestData(cls) -> None:
        cls.user = User.objects.create(phone_no='09179827587')
        cls.user.set_password('123.abc.123')
        cls.user.save()
        cls.shop = Shop(seller=cls.user,name='mypp')
        cls.shop.save()
        return super().setUpTestData()
    
    def test_add_product(self):
        data = {
            'name': 'my product',
            'price': 123,
            'description' : 'good',
            'type': 1,
            'brand':1,
            'categories':'1,2',
            'subtype':1,
            'colors': '1,2',
            'sizes': '1,2',
            'quantity': 10,
            'keywords' : 'sfsdf,fdsfds',
            'attrs':'{"":""}',
            'free_delivery': 'True'
        }
        self.client.force_login(self.user)
        res =  self.client.post('/product/add/',data)
        print(res.content)
        self.assertEqual(res.status_code,200)
    
        
    def test_add_product_when_categories_types_subtypes_colors_sizes_are_not_set(self):
        data = {
            'name': 'abbbc',
            'price': 123,
            'type': 1,
            'brand':1,
            'categories':'1,2',
            'subtype':1,
            'colors': '1,2',
            'sizes': '1,2',
            'quantity': 10,
        }
        self.client.force_login(self.user)
        res =  self.client.post('/product/add/',data)
        print(res.content)
        self.assertEqual(res.status_code,200)
    
    