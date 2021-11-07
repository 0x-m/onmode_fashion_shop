# Generated by Django 3.2.4 on 2021-11-07 21:28

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='referral_coe',
        ),
        migrations.AddField(
            model_name='user',
            name='referral',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='peers', to=settings.AUTH_USER_MODEL, verbose_name='Refferal'),
        ),
    ]
