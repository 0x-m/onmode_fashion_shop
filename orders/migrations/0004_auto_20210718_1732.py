# Generated by Django 3.2.4 on 2021-07-18 13:02

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('coupons', '0003_alter_coupon_id'),
        ('orders', '0003_auto_20210710_1107'),
    ]

    operations = [
        migrations.AlterField(
            model_name='orderlist',
            name='Address',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='orders.orderaddress', verbose_name='Address'),
        ),
        migrations.AlterField(
            model_name='orderlist',
            name='coupon',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='coupons.coupon', verbose_name='Coupon'),
        ),
    ]
