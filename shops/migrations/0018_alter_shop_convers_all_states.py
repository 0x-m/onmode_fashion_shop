# Generated by Django 3.2.4 on 2021-09-29 05:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shops', '0017_shop_convers_all_states'),
    ]

    operations = [
        migrations.AlterField(
            model_name='shop',
            name='convers_all_states',
            field=models.BooleanField(blank=True, default=False),
        ),
    ]