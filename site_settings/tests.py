from logging import setLogRecordFactory
from django.test import TestCase
from .models import SecuritySettings

class TestCounter(TestCase):
    
    @classmethod
    def setUpTestData(cls) -> None:
        cls.sec = SecuritySettings()
        cls.sec.save()
        return super().setUpTestData()
    
    def test_increment(self):
        self.sec.otp_increment()