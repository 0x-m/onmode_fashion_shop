from django.forms import widgets
from .models import OrderAddress
from django import forms

class AddressForm(forms.ModelForm):
    first_name = forms.CharField(max_length=50)
    last_name = forms.CharField(max_length=50)
    phone_no = forms.CharField(max_length=11)
    state = forms.CharField(max_length=50)
    city = forms.CharField(max_length=50)
    town = forms.CharField(max_length=50)
    postal_code = forms.CharField(max_length=50)
    description = forms.CharField(max_length=500)
    

    class Meta:
        model = OrderAddress
        fields = ['first_name','last_name','phone_no','state','city','town','postal_code', 'description']
      #   labels = {
      #       'first_name':'',
      #       'last_name':'',
      #       'phone_no':'',
      #       'state':'',
      #       'city':'',
      #       'town':'',
      #       'postal_code':'',
      #       'description':'',
      #   }
      #   widgets ={
      #       'first_name': widgets.TextInput(attrs={
      #          'class': 'text-box w-100' ,
      #          'placeholder':'نام'
      #       }),
      #       'last_name': widgets.TextInput(attrs={
      #          'class': 'text-box w-100' ,
      #          'placeholder':'نام خانوادگی'
      #       }),
      #       'phone_no': widgets.TextInput(attrs={
      #          'class': 'text-box w-100' ,
      #          'placeholder':'شماره تماس'
      #       }),
      #       'state': widgets.TextInput(attrs={
      #          'class': 'text-box w-100',
      #          'placeholder':'استان' 
      #       }),
      #       'city': widgets.TextInput(attrs={
      #          'class': 'text-box w-100' ,
      #          'placeholder':'شهرستان'
      #       }),
      #       'town': widgets.TextInput(attrs={
      #          'class': 'text-box w-100' ,
      #          'placeholder':'شهر'
      #       }),
      #       'postal_code': widgets.TextInput(attrs={
      #          'class': 'text-box w-100',
      #          'placeholder':'کد پستی' 
      #       }),
            
      #       'description': widgets.Textarea(attrs={'rows':5, 'class':'text-box w-100','placeholder':'نشانی'})
      #   }
        
  
    
    