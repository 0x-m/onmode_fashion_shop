# Generated by Django 3.2.4 on 2021-10-16 14:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0003_paymenttransaction_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='paymenttransaction',
            name='type',
            field=models.IntegerField(choices=[(0, 'checkout'), (1, 'deposit')], default=0, verbose_name='type'),
        ),
    ]