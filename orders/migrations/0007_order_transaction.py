# Generated by Django 3.2.4 on 2021-07-20 04:31

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_auto_20210720_0901'),
        ('orders', '0006_alter_orderitem_discount'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='transaction',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='orders', to='accounts.transfertransaction', verbose_name='Transaction:id'),
        ),
    ]
