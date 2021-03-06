# Generated by Django 3.2.4 on 2021-07-20 04:31

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0004_alter_account_balance'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='checkoutrequest',
            name='account',
        ),
        migrations.AddField(
            model_name='checkoutrequest',
            name='applicant',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='Checkouts', to=settings.AUTH_USER_MODEL, verbose_name='Applicant'),
        ),
        migrations.AddField(
            model_name='checkoutrequest',
            name='data_accomplished',
            field=models.DateTimeField(default=django.utils.timezone.now, verbose_name='Accomplished date'),
        ),
        migrations.AddField(
            model_name='checkoutrequest',
            name='intendant',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='intendant_checkouts', to=settings.AUTH_USER_MODEL, verbose_name='Intendant'),
        ),
        migrations.AddField(
            model_name='transfertransaction',
            name='data_accomplished',
            field=models.DateTimeField(default=django.utils.timezone.now, verbose_name='Accomplished date'),
        ),
        migrations.AlterField(
            model_name='checkoutrequest',
            name='amount',
            field=models.DecimalField(decimal_places=0, default=django.utils.timezone.now, max_digits=15, verbose_name='Amount'),
        ),
        migrations.AlterField(
            model_name='checkoutrequest',
            name='date_created',
            field=models.DateTimeField(default=django.utils.timezone.now, verbose_name='Date created'),
        ),
    ]
