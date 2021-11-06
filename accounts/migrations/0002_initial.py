# Generated by Django 3.2.4 on 2021-11-06 20:17

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='checkoutrequest',
            name='applicant',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='Checkouts', to=settings.AUTH_USER_MODEL, verbose_name='Applicant'),
        ),
        migrations.AddField(
            model_name='checkoutrequest',
            name='intendant',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='intendant_checkouts', to=settings.AUTH_USER_MODEL, verbose_name='Intendant'),
        ),
        migrations.AddField(
            model_name='account',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='account', to=settings.AUTH_USER_MODEL, verbose_name='User'),
        ),
    ]
