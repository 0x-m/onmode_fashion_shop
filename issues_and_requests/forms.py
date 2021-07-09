from django import forms
from django.core.validators import RegexValidator

class AppealforBoutiqueForm(forms.Form):
    page_name = forms.CharField(max_length=50, validators=[
        RegexValidator('^[a-z0-9_]{4,}$')
    ])
    description = forms.CharField(max_length=1000)
    

    
    