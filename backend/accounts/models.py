from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150, blank=True)
    avatar = models.TextField(blank=True, default='')
    currency = models.CharField(max_length=10, default='$')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class Account(models.Model):
    ACCOUNT_TYPES = (
        ('VISA', 'VISA'),
        ('Mastercard', 'Mastercard'),
        ('Bank', 'Bank Account'),
        ('Cash', 'Cash'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accounts')
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=ACCOUNT_TYPES, default='VISA')
    last4 = models.CharField(max_length=4, blank=True, default='0000')
    payment_mode = models.CharField(max_length=50, default='Direct Debits')
    opening_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    monthly_limit = models.DecimalField(max_digits=12, decimal_places=2, default=5000.00)
    monthly_fee = models.DecimalField(max_digits=12, decimal_places=2, default=64.83)
    is_active = models.BooleanField(default=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.type} ****{self.last4})"
