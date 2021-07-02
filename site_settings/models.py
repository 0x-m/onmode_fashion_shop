from django.db import models

class SecuritySettings(models.Model):
    otp_counter = models.PositiveBigIntegerField(default=0)
    
    @classmethod
    def otp_increment(cls):
        cls.otp_counter +=1
        cls.save()
    
    