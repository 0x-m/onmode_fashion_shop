# Generated by Django 3.2.4 on 2021-10-04 06:16

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Discount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('percent', models.PositiveIntegerField(verbose_name='Percent %')),
                ('date_created', models.DateTimeField(auto_now_add=True, verbose_name='Date created')),
                ('date_from', models.DateTimeField(verbose_name='Date from')),
                ('date_to', models.DateTimeField(verbose_name='Date to')),
                ('quantity', models.PositiveIntegerField(verbose_name='Quantity')),
                ('is_active', models.BooleanField(default=True, verbose_name='Active')),
            ],
            options={
                'verbose_name': 'Discount',
                'verbose_name_plural': 'Discounts',
            },
        ),
    ]
