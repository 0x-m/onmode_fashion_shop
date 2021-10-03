from django import template

register = template.Library()

@register.inclusion_tag('filter/product_template.html')
def render_products(products):
    return { 'products': products }
