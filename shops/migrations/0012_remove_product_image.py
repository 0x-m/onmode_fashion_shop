# Generated by Django 3.2.4 on 2021-07-13 18:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('shops', '0011_auto_20210713_1929'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='image',
        ),
    ]
