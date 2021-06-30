import django
from django.contrib.auth import base_user, login
from django.contrib.auth.models import User
from django.db import models, reset_queries
from django.http import request
from django.test import TestCase, testcases
from django.utils.html import urlize
from .models import User
from django.conf import settings

class TestEnrollment(TestCase):
    
    base_url = '/users/enrollment/'
    
    @classmethod
    def setUpTestData(cls) -> None:
        cls.user = User.objects.create(phone_no='09179827587')
        return super().setUpTestData()
    
    def test_GET_request_phone_template(self):
        res = self.client.get(self.base_url)
        self.assertTemplateUsed(res, 'registration/phone.html')

    def test_valid_new_phone_no__POST__verification_template(self):
        res = self.client.post(self.base_url,{
            'phone_no': '09179185680'
        })
        self.assertTemplateUsed(res, 'registration/verification.html')
        
    
    def test_invalid_phone_no_POST_422_code(self):
        res = self.client.post(self.base_url,{
            'phone_no': '099ddda'
        })
        self.assertEqual(res.status_code, 422)
    
    def test_existing_phone_no_POST__login_template(self):
        res = self.client.post(self.base_url,{
            'phone_no': '09179827587'
        })
        self.assertTemplateUsed(res, 'registration/login.html')
    
    def test_enrollment_request_from_authenticated_user__dashboard_template(self):
        self.client.force_login(self.user)
        res = self.client.post(self.base_url,{
            'phone_no': '09179827587'
        })
        self.assertTemplateUsed(res, 'user/dashboard.html')
        
    
    def test_enrollment_for_new_valid_phone_no__dashboard_template(self):
        res1 = self.client.post(self.base_url, {
            'phone_no': '09919115555'
        })
        verification_code = res1.context['code']
        res2 = self.client.post('/users/verification/',{
            'code':verification_code
        })
        res3 = self.client.post('/users/set_password/',{
            'password': '123456annnn',
            'confirm': '123456annnn'
        })
        self.assertTemplateUsed(res3, 'user/dashboard.html')


class TestVerification(TestCase):
    
    url = '/users/verification/'
    
    
    def test_GET_request__405_code(self):
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, 405)
    
        
    def test_when_no_phone_no_is_set__bad_request_400_code(self):
        res = self.client.post(self.url, {
            'code': '123456'
        })
        
        self.assertEqual(res.status_code, 400)
    
    def test_invalid_code__422_code_msg_invalid_code(self):
        
        res1 =  self.client.post('/users/enrollment/',{
            'phone_no':'09179552525'
        })
        #code must be 6 digits
        res = self.client.post(self.url,{
            'code': '123'
        })

        self.assertEqual(res.status_code, 422)
    
    def test_expired_code__422_code_msg_expired_or_invalid_code(self):
        self.client.post('/users/enrollment/',{
            'phone_no':'09179552525'
        })
        res = self.client.post(self.url,{
            'code': '123456'
        })
        self.assertEqual(res.status_code, 400)

    def test_valid_code__password_template(self):
        res1 = self.client.post('/users/enrollment/',{
             'phone_no':'09179552525'
        })
        code = res1.context['code']
        res = self.client.post(self.url,{
            'code': code
        })
        self.assertTemplateUsed(res, 'registration/password.html')
    
    def test_blockage_due_to_too_many_attempts(self):
        pass
    

class TestSetPassword(TestCase):

 
    url = '/users/set_password/'
    
    @classmethod
    def setUpTestData(cls) -> None:
        cls.user = User.objects.create(phone_no='09179827587')
        cls.user.set_password('123.abc.123')
        cls.user.save()
        return super().setUpTestData()
        
    def test_when_no_phone_no_is_set(self):
        res = self.client.post(self.url,{
            'password':'123456abc',
            'confirm': '123456abc'
        })
        
        self.assertEqual(res.status_code, 400)
    
    def test_unsafe_password__422_code(self):
        session = self.client.session
        session['phone_no'] = '09179954578'
        session['verified'] = 'True'
        session.save()
        res = self.client.post(self.url,{
            'password':'123',
            'confirm': '123'
        })
        print(res.content)
        self.assertEqual(res.status_code,422)
        
    #first initiate an enrollment
    #then send req to set_password....
    def test_set_password_without_sms_code_verification(self):
        self.client.post('/users/enrollment/',{
            'phone_no':'09179954545'
        })
        res = self.client.post(self.url, {
            'password': '123.ddda.123',
            'confirm': '123.ddda.123'
        })
        self.assertEqual(res.status_code, 400)
    
    def test_change_phone_no_while_setting_password(self):
        res = self.client.post('/users/enrollment/',{
            'phone_no':'09179154545'
        })
        
        code = res.context['code']
        res = self.client.post('/users/verification/',{
            'code': code
        })
        
        self.assertTemplateUsed(res,'registration/password.html')

        #change the phone_no !
        res = self.client.post('/users/enrollment/',{
            'phone_no':'09179154545'
        })
        res = self.client.post(self.url, {
            'password':'123.456.nna',
            'confirm': '123.456.nna'
        })
        self.assertEqual(res.status_code, 400)
        
        
    
    def test_set_password_for_new_user(self):
        session = self.client.session
        session['phone_no'] = '09919954578'
        session['verified'] = 'True'
        session.save()
        res = self.client.post(self.url,{
            'password':'123.aaa.123',
            'confirm': '123.aaa.123'
        })
        self.assertTemplateUsed(res,'user/dashboard.html')
    
    def test_change_password_for_user(self):
        session = self.client.session
        session['phone_no'] = '09179827587'
        session['verified'] = 'True'
        session.save()
        res = self.client.post(self.url,{
            'password':'123.aaa.123',
            'confirm': '123.aaa.123'
        })
        self.assertTemplateUsed(res,'user/dashboard.html')
    
    
    def test_GET_request__not_allowed(self):
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, 405)
   
class TestLogin(TestCase):
    
    @classmethod
    def setUpTestData(cls) -> None:
        cls.user = User.objects.create(phone_no='09179827587')
        cls.user.set_password('123.abc.123')
        cls.user.save()
        return super().setUpTestData()
    
    def test_with_get_request(self):
        res = self.client.get('/users/login/')
        self.assertEqual(res.status_code, 405)
    
    def test_when_no_phone_no_is_set_422_httpunprocessedentry(self):
        res = self.client.post('/users/login/',{
            'password': '123.abc.123'
        })
        self.assertEqual(res.status_code, 422)
    
    def test_with_invalid_password(self):
        session = self.client.session
        session['phone_no'] = '09179827587'
        session.save()
        res = self.client.post('/users/login/', {
            'password': '123'
        })
        self.assertEqual(res.status_code, 422)
    
    def test_with_correct_password__dashboard_template(self):
        session = self.client.session
        session['phone_no'] = '09179827587'
        session.save()
        res = self.client.post('/users/login/', {
            'password': '123.abc.123'
        })
        self.assertTemplateUsed(res, 'user/dashboard.html')
    
    
    
    def test_with_incorrect_password(self):
        session = self.client.session
        session['phone_no'] = '09179827587'
        session.save()
        res = self.client.post('/users/login/', {
            'password': '123.dabc.123'
        })
        print('test with incorrect password-----')
        print(res.content)
        self.assertContains(res, 'incorrect password',status_code=400)
    
    
    def test_many_attempts_restriction(self):
        pass
    

    
    
    