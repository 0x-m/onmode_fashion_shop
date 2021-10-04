# Generated by Django 3.2.4 on 2021-10-04 06:16

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('discounts', '0001_initial'),
        ('shops', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='discount',
            name='product',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='discounts', to='shops.product', verbose_name='Product'),
        ),
    ]
