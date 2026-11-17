import datetime
from decimal import Decimal
from django.utils import timezone
from accounts.models import Account
from transactions.models import Category, Transaction
from petty.models import PettyBudget
from notifications.models import Notification

def seed_user_data(user):
    # 1. Default categories
    categories_data = [
        ('Salary', 'income', 'Briefcase'),
        ('Bonus', 'income', 'Gift'),
        ('Freelance', 'income', 'Laptop'),
        ('Others', 'income', 'MoreHorizontal'),
        ('Food', 'expense', 'Utensils'),
        ('Transport', 'expense', 'Car'),
        ('Bills', 'expense', 'Receipt'),
        ('Shopping', 'expense', 'ShoppingBag'),
        ('Health', 'expense', 'Activity'),
        ('Entertainment', 'expense', 'Film'),
        ('Others', 'expense', 'MoreHorizontal'),
    ]

    cat_map = {}
    for name, kind, icon in categories_data:
        cat, _ = Category.objects.get_or_create(user=user, name=name, kind=kind, defaults={'icon': icon})
        cat_map[f"{kind}:{name}"] = cat

    # 2. Default accounts
    visa_acc, _ = Account.objects.get_or_create(
        user=user,
        last4='2874',
        defaults={
            'name': 'VISA Premium Debit',
            'type': 'VISA',
            'payment_mode': 'Direct Debits',
            'opening_balance': Decimal('15000.00'),
            'monthly_limit': Decimal('18000.00'),
            'monthly_fee': Decimal('64.83'),
            'is_primary': True,
            'is_active': True,
        }
    )

    savings_acc, _ = Account.objects.get_or_create(
        user=user,
        last4='9102',
        defaults={
            'name': 'High Yield Savings',
            'type': 'Bank',
            'payment_mode': 'Standing Order',
            'opening_balance': Decimal('28500.00'),
            'monthly_limit': Decimal('5000.00'),
            'monthly_fee': Decimal('0.00'),
            'is_primary': False,
            'is_active': True,
        }
    )

    cash_acc, _ = Account.objects.get_or_create(
        user=user,
        last4='0000',
        defaults={
            'name': 'Cash Wallet',
            'type': 'Cash',
            'payment_mode': 'Manual',
            'opening_balance': Decimal('1500.00'),
            'monthly_limit': Decimal('2000.00'),
            'monthly_fee': Decimal('0.00'),
            'is_primary': False,
            'is_active': True,
        }
    )

    # 3. Reference Transactions matching screenshot
    if Transaction.objects.filter(user=user).count() == 0:
        txns = [
            {
                'name': 'PayPal',
                'reference_id': '#748373',
                'kind': 'income',
                'category': cat_map.get('income:Freelance'),
                'amount': Decimal('8474.00'),
                'date': datetime.date(2024, 7, 7),
                'time': datetime.time(11, 30),
                'status': 'Successful',
                'account': visa_acc,
                'notes': 'Client design milestone payment',
                'is_petty': False,
            },
            {
                'name': 'Wise',
                'reference_id': '#748374',
                'kind': 'expense',
                'category': cat_map.get('expense:Others'),
                'amount': Decimal('4568.00'),
                'date': datetime.date(2024, 7, 6),
                'time': datetime.time(11, 40),
                'status': 'Pending',
                'account': visa_acc,
                'notes': 'Supplier inventory transfer',
                'is_petty': False,
            },
            {
                'name': 'Atlassian',
                'reference_id': '#748375',
                'kind': 'expense',
                'category': cat_map.get('expense:Bills'),
                'amount': Decimal('6642.00'),
                'date': datetime.date(2024, 7, 5),
                'time': datetime.time(22, 30),
                'status': 'Successful',
                'account': visa_acc,
                'notes': 'Cloud Jira & Confluence annual subscription',
                'is_petty': False,
            },
            {
                'name': 'Hotjar',
                'reference_id': '#748376',
                'kind': 'expense',
                'category': cat_map.get('expense:Bills'),
                'amount': Decimal('7543.00'),
                'date': datetime.date(2024, 7, 4),
                'time': datetime.time(0, 24),
                'status': 'Successful',
                'account': visa_acc,
                'notes': 'Analytics platform business tier renewal',
                'is_petty': False,
            },
            # Additional recent transactions & petty expenses
            {
                'name': 'Stripe Payout',
                'reference_id': '#748377',
                'kind': 'income',
                'category': cat_map.get('income:Salary'),
                'amount': Decimal('12500.00'),
                'date': datetime.date(2024, 7, 1),
                'time': datetime.time(9, 0),
                'status': 'Successful',
                'account': visa_acc,
                'notes': 'Monthly base consulting retainer',
                'is_petty': False,
            },
            {
                'name': 'Starbucks Coffee & Snacks',
                'reference_id': '#748378',
                'kind': 'expense',
                'category': cat_map.get('expense:Food'),
                'amount': Decimal('28.50'),
                'date': datetime.date(2024, 7, 6),
                'time': datetime.time(14, 15),
                'status': 'Successful',
                'account': cash_acc,
                'notes': 'Team meeting beverages',
                'is_petty': True,
            },
            {
                'name': 'City Taxi Fare',
                'reference_id': '#748379',
                'kind': 'expense',
                'category': cat_map.get('expense:Transport'),
                'amount': Decimal('45.00'),
                'date': datetime.date(2024, 7, 5),
                'time': datetime.time(18, 45),
                'status': 'Successful',
                'account': visa_acc,
                'notes': 'Airport cab ride',
                'is_petty': True,
            },
            {
                'name': 'Office Stationery & Notepads',
                'reference_id': '#748380',
                'kind': 'expense',
                'category': cat_map.get('expense:Bills'),
                'amount': Decimal('62.30'),
                'date': datetime.date(2024, 7, 3),
                'time': datetime.time(16, 20),
                'status': 'Successful',
                'account': cash_acc,
                'notes': 'Printer paper and pens',
                'is_petty': True,
            },
            {
                'name': 'Quick Lunch Bistro',
                'reference_id': '#748381',
                'kind': 'expense',
                'category': cat_map.get('expense:Food'),
                'amount': Decimal('34.20'),
                'date': datetime.date(2024, 7, 2),
                'time': datetime.time(12, 30),
                'status': 'Successful',
                'account': cash_acc,
                'notes': 'Lunch during client review',
                'is_petty': True,
            },
        ]

        for item in txns:
            Transaction.objects.create(user=user, **item)

    # 4. Petty Budget
    now_month = timezone.now().strftime('%Y-%m')
    PettyBudget.objects.get_or_create(
        user=user,
        month=now_month,
        defaults={'amount': Decimal('1000.00')}
    )

    # 5. Notifications
    if Notification.objects.filter(user=user).count() == 0:
        notifs = [
            ('Pending Transaction Alert', 'Wise transaction #748374 ($4568) is awaiting bank settlement.', 'warning'),
            ('Card Limit Warning', 'VISA Debit **** 2874 monthly spend reached 72% of $18,000 limitation.', 'alert'),
            ('Petty Budget Update', 'Petty expenses for current period total $170.00 of $1,000.00 budgeted.', 'info'),
        ]
        for title, msg, ntype in notifs:
            Notification.objects.create(user=user, title=title, message=msg, type=ntype, is_read=False)
