import re
from typing import OrderedDict, SupportsBytes
from django.db.models import fields
from django.db.models.query import FlatValuesListIterable, prefetch_related_objects
from django.forms.widgets import SelectDateWidget

from django.shortcuts import resolve_url
from django.utils.html import TRAILING_PUNCTUATION_CHARS
from product_attributes.models import Color, Size
from django.core.exceptions import ValidationError
from .models import Brand, Category, Shop, SubType, Type
from django import forms
from django.core.validators import RegexValidator
from django.forms.models import model_to_dict
import json

class AppealForm(forms.Form):
    page_name = forms.CharField(max_length=50,validators=[
        RegexValidator('[^a-z0-9]')
    ])
    description = forms.CharField(max_length=500)

class StringTagField(forms.Field):
    def to_python(self, value):
        if not value or value == "":
            return " "
        return  ''.join((s.strip() + ',') for s in value.strip().split('#'))

class IntegerCSVFields(forms.Field):
    def to_python(self, value):
        try:
            return [int(i) for i in value.split(',')]
        except:
            raise ValidationError("Invalid ids")
        
    
class JsonField(forms.Field):
    def to_python(self, value):
        if not value:
            return {}
        return json.loads(value)
        
class AddProductForm(forms.Form):
    brand = forms.IntegerField()
    categories = IntegerCSVFields()
    type = forms.IntegerField()
    subtype = forms.IntegerField()
    colors = IntegerCSVFields()
    sizes = IntegerCSVFields()
    name = forms.CharField(max_length=120)
    description = forms.CharField(max_length=500,empty_value="بدون توضیحات")
    quantity = forms.IntegerField()
    keywords = StringTagField()
    attrs = JsonField()
    price = forms.IntegerField()
    
    def clean_brand(self):
        id = self.cleaned_data['brand']
        brand = Brand.objects.filter(id=id).first()
        if not brand:
            raise ValidationError('Brand is not defined')
        return brand
    
    def clean_categories(self):
        ids = self.cleaned_data['categories']
        cateegories = Category.objects.filter(id__in=ids)
        if len(ids) != len(cateegories):
            raise ValidationError('Some categories are not defined')
        return cateegories
    
    def clean_type(self):
        id = self.cleaned_data['type']
        type = Type.objects.filter(id=id).first()
        if not type:
            raise ValidationError("Type is not defined")
        return type
    
    
    def clean_subtype(self):
        id = self.cleaned_data['subtype']
        subtype = SubType.objects.filter(id=id).first()
        if not subtype:
            raise ValidationError("Subtype is not defined")
        return subtype
    
    
    def clean_colors(self):
        color_ids = self.cleaned_data['colors']
        colors = Color.objects.filter(id__in=color_ids)
        if len(color_ids) != len(colors):
            raise ValidationError("some colors are not defined")
        return colors
    
    def clean_sizes(self):
        size_ids = self.cleaned_data['sizes']
        sizes = Size.objects.filter(id__in=size_ids)
        if len(size_ids) != len(sizes):
            raise ValidationError("Some sizes are not defined")
        return sizes 
    
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
    


class FilterForm(forms.Form):
    price_from = forms.IntegerField()
    price_to = forms.IntegerField()
    categories = IntegerCSVFields()
    types = IntegerCSVFields()
    subtypes = IntegerCSVFields()
    colors = IntegerCSVFields()
    sizes = IntegerCSVFields()
    brands = IntegerCSVFields()
    order_by = forms.CharField(max_length=20)
    order_kind = forms.CharField(max_length=20) 
    
    def clean_order_by(self):
        try:
            
          order_by = self.cleaned_data['order_by']
        except:
            order_by = "date_created"
        if order_by == 'price' or order_by == 'date_created':
            return order_by
        
        raise ValidationError("invalid order_by")
    
    def clean_order_kind(self):
        try:
             kind = self.cleaned_data['order_kind']
        except:
            kind = "asc"
            
        if kind == 'asc' or kind == 'desc':
            return kind
        raise ValidationError("Invalid order kind")
        
    def clean_price_from(self):
        price_from = self.cleaned_data['price_from']
        if (price_from < 0):
            raise ValidationError("price must be positive")
        return price_from
    
    
    def clean_price_to(self):
        price_to = self.cleaned_data['price_to']
        if (price_to < 0):
            raise ValidationError("price must be positive")
        return price_to
    
    def clean(self) :
        price_from = self.cleaned_data['price_from']
        price_to = self.cleaned_data['price_to']
        if (price_from > price_to):
            raise ValidationError("invalid price range")
        return super().clean()
    

class ShopInfoForm(forms.ModelForm):
    class Meta:
        model = Shop
        fields = ['title','description','address','shop_phone','post_destinations']
        
    
    
    

    
    
