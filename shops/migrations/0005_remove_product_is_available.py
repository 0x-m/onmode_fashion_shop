# Generated by Django 3.1.7 on 2021-07-09 08:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('shops', '0004_product_is_active'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='is_available',
        ),
    ]