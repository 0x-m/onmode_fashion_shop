# Generated by Django 3.2.4 on 2021-07-15 18:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('issues_and_requests', '0005_auto_20210710_1107'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='issue',
            name='order',
        ),
        migrations.AddField(
            model_name='issue',
            name='help',
            field=models.CharField(default='', max_length=2000, verbose_name='help'),
        ),
    ]