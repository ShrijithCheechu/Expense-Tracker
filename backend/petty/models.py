from django.db import models
from django.conf import settings

class PettyBudget(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='petty_budgets')
    month = models.CharField(max_length=7)  # YYYY-MM
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=1000.00)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'month')

    def __str__(self):
        return f"{self.user.email} - {self.month} - ${self.amount}"
