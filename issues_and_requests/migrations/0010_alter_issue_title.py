# Generated by Django 3.2.4 on 2021-10-02 18:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('issues_and_requests', '0009_remove_issue_state'),
    ]

    operations = [
        migrations.AlterField(
            model_name='issue',
            name='title',
            field=models.CharField(blank=True, max_length=100, verbose_name='Title'),
        ),
    ]
