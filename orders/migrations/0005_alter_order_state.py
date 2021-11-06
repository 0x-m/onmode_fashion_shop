# Generated by Django 3.2.4 on 2021-11-06 13:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0004_alter_order_tracking_code_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='state',
            field=models.CharField(choices=[('pending', 'pending'), ('accept', 'accept'), ('rejected', 'rejected'), ('sent', 'sent'), ('received', 'recieved'), ('cancelled', 'cancelled'), ('returned', 'returned'), ('sent_not_verified', 'not verified')], default='pending', max_length=20, verbose_name='State'),
        ),
    ]
