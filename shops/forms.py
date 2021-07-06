from typing import OrderedDict, SupportsBytes
from django.db.models.query import FlatValuesListIterable
from django.forms.widgets import SelectDateWidget

from django.shortcuts import resolve_url
from django.utils.html import TRAILING_PUNCTUATION_CHARS
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
    
    def clean_id(self):
        if self.cleaned_data['id'] < 0:
            raise ValidationError("id must be positive or zero")
        return self.cleaned_data['id']
    


class FilterForm(forms.Form):
    price_from = forms.CharField(max_length=10)
    price_to = forms.CharField(max_length=10)
    categories = CSVField()
    types = CSVField()
    subtypes = CSVField()
    colors = CSVField()
    sizes = CSVField()
    brands = CSVField()
    discounted = forms.BooleanField()
    order_by = forms.CharField(max_length=20)
    order_kind = forms.CharField(max_length=20) 
    shop_ids = CSVField()
    
    def clean_order_by(self):
        order_by = self.cleaned_data['order_by']
        kind = self.cleaned_data['order_kin']
        if order_by == 'price' or order_by == 'date_created':
            order = ''
            if kind == 'asc':
                order = '+' + order_by
            elif kind == 'desc':
                order = '-' + order_by
            return order
        
        raise ValidationError("invalid order_by")
    
    def clean_order_kind(self):
        kind = self.cleaned_data['order_kind']
        if kind == 'asc' or kind == 'desc':
            return kind
        raise ValidationError("Invalid order kind")
        
    def clean_price_from(self):
        price_from = self.cleaned_data['price_form']
        price_to = self.cleaned_data['price_to']
        
        if (price_from < 0) or (price_from > price_to):
            raise ValidationError("invalid price range")
        return price_from
    
    
    def clean_price_to(self):
        price_from = self.cleaned_data['price_form']
        price_to = self.cleaned_data['price_to']
        if (price_to < 0) or (price_from < price_to):
            raise ValidationError("invalid price range")
        return price_to
    
    
    def clean_brands(self):
        ids = self.cleaned_data['brands']
        if ids == '':
            ids = Brand.objects.all().values_list('id',flat=True)
        return ids
    
    def clean_categories(self):
        ids = self.cleaned_data['categories']
        if ids == '':
            ids = Category.objects.all().values_list('id',flat=True)
        return ids
    
    
    def clean_types(self):
        ids = self.cleaned_data['types']
        if ids == "":
            ids = Type.objects.all().values_list('id',flat=True)
        raise ids
    
    
    
    def clean_subtypes(self):
        ids = self.cleaned_data['subtypes']
        subtypes = SubType.objects.filter(id__in=ids)
        if ids == "":
            ids = SubType.objects.all().values_list('id',flat=True)
        return ids
    
    def clean_colors(self):
        ids = self.cleaned_data['colors']
        if ids == "":
            ids = Color.objects.all().values_list('id',flat=True)
    
    def clean_sizes(self):
        ids = self.cleaned_data['sizes']
        if ids == "":
            ids = Size.objects.all().values_list('id',flat=True)
        return ids
    
    