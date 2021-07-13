# Generated by Django 3.2.4 on 2021-07-12 19:24

import django.core.validators
from django.db import migrations, models
import shops.models


class Migration(migrations.Migration):

    dependencies = [
        ('shops', '0008_auto_20210710_1107'),
    ]

    operations = [
        migrations.AlterField(
            model_name='shop',
            name='banner',
            field=models.ImageField(blank=True, null=True, upload_to=shops.models.Shop.generate_path, verbose_name='Banner'),
        ),
        migrations.AlterField(
            model_name='shop',
            name='logo',
            field=models.ImageField(blank=True, null=True, upload_to=shops.models.Shop.generate_path, verbose_name='Logo'),
        ),
        migrations.AlterField(
            model_name='shop',
            name='shop_phone',
            field=models.CharField(blank=True, max_length=20, null=True, validators=[django.core.validators.RegexValidator('^[0-9]*$')], verbose_name='cell phone'),
        ),
    ]