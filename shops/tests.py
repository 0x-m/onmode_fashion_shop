from django.http import request
from users.models import User
from django.shortcuts import redirect
from django.test import TestCase

class TestMakeAppeal(TestCase):
    
    @classmethod
    def setUpTestData(cls) -> None:
        cls.user = User.objects.create(phone_no='09179827587')
        cls.user1 = User.objects.create(phone_no="09179887585")
        
        return super().setUpTestData()
    
    def test_GET_new_appeal_request_template(self):
        self.client.force_login(self.user)
        res = self.client.get('/shops/appeal/')
        self.assertTemplateUsed(res, 'shop/request.html')
    
    def test_GET_an_appeal_exists_appeal_template(self):
        self.client.force_login(self.user)
        res = self.client.post('/shops/appeal/', {
            'page_name': 'my_page',
            'description': 'aaa'
        })
        res = self.client.get('/shops/appeal/')
        self.assertTemplateUsed(res, 'shop/appeal.html')
        
    
    def test_make_new_appeal(self):
        self.client.force_login(self.user)
        res = self.client.post('/shops/appeal/',{
            'page_name': 'my_page',
            'description': '12dsfds'
        })
      
        self.assertContains(res, 'registered',status_code=200)
    
    def test_make_redundant_appeal(self):
        self.client.force_login(self.user)
        res = self.client.post('/shops/appeal/',{
            'page_name': 'my_page',
            'description': '12dsfds'
        })
        res = self.client.post('/shops/appeal/',{
            'page_name': 'my_page',
            'description': '12dsfds'
        })
        self.assertTemplateUsed(res, 'shop/appeal.html')
    
    def test_page_name_not_provided_400_code(self):
        self.client.force_login(self.user)
        res = self.client.post('/shops/appeal/')
        self.assertContains(res, 'not provided',status_code=400)
    
    def page_name_exists_400_Code(self):
        self.client.force_login(self.user)
        res = self.client.post('shops/appeal', {
            'page_name': 'my_page'
        })
        self.client.force_login(self.user1)
        res = self.client.post('shops/appeal',{
            'page_name': 'my_page'
        })
        self.assertContains(res, 'exist', status_code=400)
        