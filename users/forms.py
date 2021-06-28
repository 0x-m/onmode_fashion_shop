from django import forms
from django.core.exceptions import ImproperlyConfigured
from django.forms.forms import Form
from django.core.validators import MaxLengthValidator, RegexValidator
from django.contrib.auth.password_validation import validate_password
from django.forms.models import ModelForm, model_to_dict


class PhoenForm(forms.Form):
    phone_no = forms.CharField(max_length=11,validators=[
        RegexValidator("^09[0-9]{9}$")
    ])

class SetPasswordForm(forms.Form):
    password = forms.CharField(widget=forms.PasswordInput, min_length=8)
    confirm = forms.CharField(widget=forms.PasswordInput, min_length=8)
    
    def clean_password(self):
        password = self.data['password']
        if password == self.data['confirm']:
            return password
          
        else:
            msg  = "incorrect password confiramtion"
            
        raise Exception(msg + password)

class VerificationForm(Form):
    code = forms.CharField(max_length=6)
    

class LoginForm(Form):
    password = forms.CharField(widget=forms.PasswordInput, min_length=8)
    
class ProfileForm(ModelForm):
    pass
class AddressForm(ModelForm):
    pass