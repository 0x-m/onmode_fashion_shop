# Generated by Django 3.2.4 on 2021-07-02 07:04

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('balance', models.DecimalField(decimal_places=0, max_digits=15, verbose_name='Balance')),
                ('last_updated', models.DateTimeField(auto_now=True, verbose_name='Last Update')),
            ],
            options={
                'verbose_name': 'Account',
                'verbose_name_plural': 'Accounts',
            },
        ),
        migrations.CreateModel(
            name='TransferTransaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateTimeField(auto_now_add=True, verbose_name='Date created')),
                ('amount', models.DecimalField(decimal_places=0, max_digits=15, verbose_name='Amount')),
                ('state', models.CharField(choices=[('pending', 'prepared'), ('committed', 'committed'), ('rollbacked', 'rollbacked')], default='pending', max_length=20, verbose_name='State')),
                ('creditor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='credits', to='accounts.account', verbose_name='creditor')),
                ('debtor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='debts', to='accounts.account', verbose_name='debtor')),
            ],
            options={
                'verbose_name': 'Transfer Transaction',
                'verbose_name_plural': 'Transfer Tranactions',
            },
        ),
        migrations.CreateModel(
            name='DepositTransaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.PositiveIntegerField(verbose_name='Amount')),
                ('date_created', models.DateTimeField(auto_now_add=True, verbose_name='Date Created')),
                ('state', models.CharField(choices=[('committed', 'committed'), ('pending', 'pending')], default='pending', max_length=20)),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='deposits', to='accounts.account', verbose_name='Account')),
            ],
            options={
                'verbose_name': 'Deposit Transaction',
                'verbose_name_plural': 'Deposit Transactions',
            },
        ),
        migrations.CreateModel(
            name='CheckoutRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateField(auto_now=True, verbose_name='Date created')),
                ('amount', models.DecimalField(decimal_places=0, max_digits=15, verbose_name='Amount')),
                ('description', models.TextField(max_length=500, null=True, verbose_name='Description')),
                ('state', models.CharField(choices=[('pending', 'pending'), ('accepted', 'accepted'), ('rejected', 'rejected')], default='pending', max_length=20, verbose_name='state')),
                ('status', models.TextField(max_length=500, null=True, verbose_name='status')),
                ('fee', models.DecimalField(decimal_places=0, default=0, max_digits=15, verbose_name='Fee')),
                ('final_amount', models.DecimalField(decimal_places=0, default=0, max_digits=15, verbose_name='Final Amount')),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='checkouts', to='accounts.account', verbose_name='Account')),
            ],
            options={
                'verbose_name': 'Checkout Request',
                'verbose_name_plural': 'Checkout Requests',
            },
        ),
    ]
