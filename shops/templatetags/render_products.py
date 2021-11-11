from django import template

register = template.Library()

@register.inclusion_tag('filter/product_template.html', takes_context=True)
def render_products(context, products):
    return { 'products': products, 'user': context['user'] }
