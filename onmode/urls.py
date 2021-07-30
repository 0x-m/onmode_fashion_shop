

from shops import urls
from os import name
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf  import Settings, settings

urlpatterns = [

    path('admin/', admin.site.urls),
    path('users/', include('users.urls', namespace='users')),
    path('favourites/', include('favourites.urls', namespace='favourites')),
    path('cart/', include('cart.urls', namespace='cart')),
    path('payments/', include('payments.urls', namespace='payments')),
    path('messages/', include('messaging.urls', namespace='messaging')),
    path('comments/', include('reviews.urls', namespace='comments')),
    path('', include('index.urls', namespace='index')),
    path('', include('shops.urls', namespace='shops')),
    path('', include('accounts.urls', namespace='accounts')),
    path('',include('issues_and_requests.urls', namespace='issues')),
    path('',include('orders.urls',namespace='orders')),

] #+ static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
