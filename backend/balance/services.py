from decimal import Decimal
from django.db.models import Sum, Q
from transactions.models import Transaction
from accounts.models import Account

class BalanceService:
    @staticmethod
    def get_account_balance(account):
        """
        Account current balance = opening balance + sum(successful income) - sum(successful expenses)
        """
        income = Transaction.objects.filter(
            account=account,
            kind='income',
            status='Successful'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        expense = Transaction.objects.filter(
            account=account,
            kind='expense',
            status='Successful'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        return account.opening_balance + income - expense

    @staticmethod
    def get_total_balance(user):
        """
        Total balance = sum of current balances of all active accounts
        """
        accounts = Account.objects.filter(user=user, is_active=True)
        total = Decimal('0.00')
        for acc in accounts:
            total += BalanceService.get_account_balance(acc)
        return total

    @staticmethod
    def calculate_percentage_change(current, previous):
        """
        Percentage change = (current - previous) / previous * 100; if previous is 0, display 'N/A'
        """
        if not previous or previous == Decimal('0.00'):
            return "N/A" if not current or current == Decimal('0.00') else "+100.0%"
        diff = ((current - previous) / previous) * 100
        sign = "+" if diff > 0 else ""
        return f"{sign}{diff:.1f}%"
