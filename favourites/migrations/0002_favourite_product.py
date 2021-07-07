# Generated by Django 3.1.7 on 2021-07-06 17:55

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('shops', '0001_initial'),
        ('favourites', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='favourite',
            name='product',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favs', to='shops.product', verbose_name='Product'),
        ),
    ]