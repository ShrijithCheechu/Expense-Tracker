import random
from django.db import models
from django.conf import settings

class Category(models.Model):
    KINDS = (
        ('income', 'Income'),
        ('expense', 'Expense'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='categories')
    name = models.CharField(max_length=100)
    kind = models.CharField(max_length=10, choices=KINDS, default='expense')
    icon = models.CharField(max_length=50, default='Tag')

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return f"{self.name} ({self.kind})"

class Transaction(models.Model):
    KINDS = (
        ('income', 'Income'),
        ('expense', 'Expense'),
    )
    STATUSES = (
        ('Successful', 'Successful'),
        ('Pending', 'Pending'),
        ('Failed', 'Failed'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    account = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    reference_id = models.CharField(max_length=30, blank=True, db_index=True)
    name = models.CharField(max_length=255)
    kind = models.CharField(max_length=10, choices=KINDS, default='expense')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUSES, default='Successful')
    notes = models.TextField(blank=True, default='')
    is_petty = models.BooleanField(default=False)
    receipt = models.FileField(upload_to='receipts/', null=True, blank=True)
    transfer_counterpart = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_transfers')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.reference_id:
            self.reference_id = f"#{random.randint(100000, 999999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.kind} - ${self.amount}"
