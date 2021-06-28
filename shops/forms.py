from django import forms
from django.core.validators import RegexValidator

class AppealForm(forms.Form):
    page_name = forms.CharField(max_length=50,validators=[
        RegexValidator('[^a-z0-9]')
    ])
    description = forms.CharField(max_length=500)
    
