from django.urls import path
from . import views
app_name = 'comments'
urlpatterns = [
    path('product/<product_id>/',views.get_product_comments, name='all'),
    path('product/<product_id>/leave/',views.leave_comment, name='leave'),
    path('product/<product_id>/remove/',views.remove_comment, name='remove')
]