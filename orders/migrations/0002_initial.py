# Generated by Django 3.2.4 on 2021-06-30 03:58

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('orders', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('shops', '0001_initial'),
        ('discounts', '0002_discount_product'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderlist',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, related_name='order_lists', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='color',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='shops.color'),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='discount',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='discounts.discount'),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='order',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='orders.order'),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='product',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='shops.product'),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='size',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='shops.size'),
        ),
        migrations.AddField(
            model_name='order',
            name='order_list',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='orders', to='orders.orderlist'),
        ),
        migrations.AddField(
            model_name='order',
            name='shop',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, related_name='orders', to='shops.shop'),
        ),
        migrations.AddField(
            model_name='order',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='orders', to=settings.AUTH_USER_MODEL),
        ),
    ]
