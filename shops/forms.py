from typing import SupportsBytes
from django.forms.widgets import SelectDateWidget

from django.shortcuts import resolve_url
from product_attributes.models import Color, Size
from django.core.exceptions import ValidationError
from .models import Brand, Category, SubType, Type
from django import forms
from django.core.validators import RegexValidator
from django.forms.models import model_to_dict
import json
class AppealForm(forms.Form):
    page_name = forms.CharField(max_length=50,validators=[
        RegexValidator('[^a-z0-9]')
    ])
    description = forms.CharField(max_length=500)

class CSVField(forms.Field):
    def to_python(self, value):
        if not value:
            return []
        return value.split(',')
    
    
class JsonField(forms.Field):
    def to_python(self, value):
        if not value:
            return {}
        return json.loads(value)
        
class AddProductForm(forms.Form):
    id = forms.IntegerField()
    brand = forms.IntegerField()
    categories = CSVField()
    type = forms.IntegerField()
    subtype = forms.IntegerField()
    colors = CSVField()
    sizes = CSVField()
    name = forms.CharField(max_length=120)
    description = forms.CharField(max_length=500)
    is_available = forms.BooleanField()
    quantity = forms.IntegerField()
    keywords = CSVField()
    attrs = JsonField()
    images = forms.ImageField()
    avatar = forms.ImageField()
    price = forms.IntegerField()
    
    def clean_brand(self):
        id = self.cleaned_data['brand']
        count = Brand.objects.filter(id=id).count()
        if count == 0:
            raise ValidationError('Brand is not defined')
        return id
    
    def clean_categories(self):
        ids = self.cleaned_data['categories']
        count = Category.objects.filter(id_in=ids).count()
        if len(ids) != count:
            raise ValidationError('Some categories are not defined')
        return ids
    
    def clean_type(self):
        id = self.cleaned_data['type']
        count = Type.objects.filter(id=id).count()
        if count == 0:
            raise ValidationError("Type is not defined")
        return id
    
    
    def clean_subtype(self):
        id = self.cleaned_data['subtype']
        count = SubType.objects.filter(id=id).count()
        if count == 0:
            raise ValidationError("Subtype is not defined")
        return id
    
    
    def clean_colors(self):
        color_ids = self.cleaned_data['colors']
        color_count = Color.objects.filter(id__in=color_ids).count()
        if len(color_ids) != color_count:
            raise ValidationError("some colors are not defined")
        return color_ids
    
    def clean_sizes(self):
        size_ids = self.cleaned_data['sizes']
        size_count = Size.objects.filter(id__in=size_ids).count()
        if len(size_ids) != size_count:
            raise ValidationError("Some sizes are not defined")
        return size_ids 
    
    def clean_quantity(self):
        quantity = self.cleaned_data['quantity']
        if quantity < 0:
            raise ValidationError("quantity must be positive")
        return quantity
    
    
    def clean_price(self):
        price = self.cleaned_data['price']
        if price < 0:
            raise ValidationError("Price must be positive")
        return price
    
    def clean_id(self):
        if self.cleaned_data['id'] < 0:
            raise ValidationError("id must be positive or zero")
        return self.cleaned_data['id']
    
