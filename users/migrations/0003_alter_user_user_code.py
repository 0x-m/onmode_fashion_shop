# Generated by Django 3.2.4 on 2021-06-28 18:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_user_points'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='user_code',
            field=models.CharField(max_length=20),
        ),
    ]
