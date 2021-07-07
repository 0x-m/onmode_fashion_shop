from django import template
from discounts.models import Discount
from django.utils import timezone

register = template.library()

def discounted_price(value):
    dt = timezone.now()
    p = Discount.objects.filter(product=value,is_active=True,
                                date_from__gte=dt,
                                date_to__lte=dt).first()
    if p:
        return p.get_discounted_price()
    return value.price

register.filter('discounted_price', discounted_price)
