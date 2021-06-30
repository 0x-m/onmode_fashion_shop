from django.test import TestCase

class TestPaymentRequest(TestCase):
    
    def test_send_request(self):
        res = self.client.get('/payments/request/')
        self.assertRedirects(res,'https://www.sandbox.zarinpal.com/pg/StartPay/')
    
    