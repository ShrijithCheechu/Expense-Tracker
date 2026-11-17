import os
import django
from decimal import Decimal
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User, Account
from transactions.models import Category, Transaction
from petty.models import PettyBudget
from notifications.models import Notification
from balance.services import BalanceService
from common_seed import seed_user_data

class ExpenseTracker20TestCases(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Primary test user
        self.user = User.objects.create_user(
            username='tester@expensetracker.io',
            email='tester@expensetracker.io',
            name='Test User',
            password='Password123!',
            currency='$'
        )
        seed_user_data(self.user)

        # Login to obtain JWT
        login_res = self.client.post('/api/v1/auth/login/', {
            'email': 'tester@expensetracker.io',
            'password': 'Password123!'
        }, format='json')
        self.token = login_res.data['access']
        self.auth_headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}

        # Secondary user for isolation testing
        self.user2 = User.objects.create_user(
            username='isolated@expensetracker.io',
            email='isolated@expensetracker.io',
            name='Isolated User',
            password='Password123!'
        )
        seed_user_data(self.user2)
        login_res2 = self.client.post('/api/v1/auth/login/', {
            'email': 'isolated@expensetracker.io',
            'password': 'Password123!'
        }, format='json')
        self.token2 = login_res2.data['access']
        self.auth_headers2 = {'HTTP_AUTHORIZATION': f'Bearer {self.token2}'}

    # TC-01: User Registration
    def test_01_user_registration(self):
        res = self.client.post('/api/v1/auth/register/', {
            'email': 'new.user@fintech.io',
            'name': 'New User',
            'password': 'SecurePassword123'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertIn('user', res.data)
        self.assertEqual(res.data['user']['email'], 'new.user@fintech.io')
        # Check auto seed
        u = User.objects.get(email='new.user@fintech.io')
        self.assertGreater(u.accounts.count(), 0)

    # TC-02: User Login & JWT Token issuance
    def test_02_user_login_jwt(self):
        res = self.client.post('/api/v1/auth/login/', {
            'email': 'tester@expensetracker.io',
            'password': 'Password123!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    # TC-03: Instant Demo Login & Auto-seeding
    def test_03_instant_demo_login_and_seeding(self):
        res = self.client.post('/api/v1/auth/demo-login/', {}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['user']['email'], 'alex.morgan@fintech.io')
        demo_user = User.objects.get(email='alex.morgan@fintech.io')
        self.assertGreaterEqual(demo_user.transactions.count(), 4)

    # TC-04: Unauthenticated Access Protection
    def test_04_unauthenticated_access_protection(self):
        # Client without token
        unauth_client = APIClient()
        res = unauth_client.get('/api/v1/dashboard/summary/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    # TC-05: User Data Isolation
    def test_05_user_data_isolation(self):
        # User 1 creates a private transaction
        t = Transaction.objects.create(
            user=self.user,
            name='Secret Consulting Revenue',
            kind='income',
            amount=Decimal('9999.00'),
            date=datetime.date.today(),
            time=datetime.time(10, 0),
            status='Successful'
        )
        # User 2 lists transactions
        res = self.client.get('/api/v1/transactions/?search=Secret+Consulting', **self.auth_headers2)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        items = res.data.get('results', res.data)
        self.assertEqual(len(items), 0)

    # TC-06: Dashboard Summary & Reference Metrics Calculation
    def test_06_dashboard_summary_metrics(self):
        res = self.client.get('/api/v1/dashboard/summary/?period=weekly&date=2024-04-16', **self.auth_headers)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('statistics', res.data)
        self.assertIn('primary_card', res.data)
        self.assertIn('total_balance', res.data)
        self.assertIn('expense_categories', res.data)
        self.assertEqual(res.data['primary_card']['last4'], '2874')
        self.assertEqual(len(res.data['statistics']['chart_series']), 7)

    # TC-07: Transaction Creation & Auto Reference ID Generation
    def test_07_transaction_creation_auto_reference_id(self):
        account = self.user.accounts.first()
        res = self.client.post('/api/v1/transactions/', {
            'name': 'Cloud Hosting Services',
            'kind': 'expense',
            'amount': '120.00',
            'date': '2024-07-08',
            'time': '12:00:00',
            'status': 'Successful',
            'account': account.id
        }, format='json', **self.auth_headers)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['reference_id'].startswith('#'))
        self.assertEqual(len(res.data['reference_id']), 7)

    # TC-08: Transaction Amount Validation (Negative/zero rejected)
    def test_08_transaction_amount_validation(self):
        res_neg = self.client.post('/api/v1/transactions/', {
            'name': 'Negative Invalid Charge',
            'kind': 'expense',
            'amount': '-15.00',
            'date': '2024-07-08',
            'time': '12:00:00',
        }, format='json', **self.auth_headers)
        self.assertEqual(res_neg.status_code, status.HTTP_400_BAD_REQUEST)

        res_zero = self.client.post('/api/v1/transactions/', {
            'name': 'Zero Charge',
            'kind': 'expense',
            'amount': '0.00',
            'date': '2024-07-08',
            'time': '12:00:00',
        }, format='json', **self.auth_headers)
        self.assertEqual(res_zero.status_code, status.HTTP_400_BAD_REQUEST)

    # TC-09: Pending Transactions Excluded from Balance (FR-TXN-04)
    def test_09_pending_transactions_excluded_from_balance(self):
        account = self.user.accounts.get(last4='2874')
        initial_balance = BalanceService.get_account_balance(account)

        # Create Pending transaction
        txn = Transaction.objects.create(
            user=self.user,
            account=account,
            name='Wire In Transit',
            kind='expense',
            amount=Decimal('500.00'),
            date=datetime.date.today(),
            time=datetime.time(11, 0),
            status='Pending'
        )

        # Balance must NOT change
        self.assertEqual(BalanceService.get_account_balance(account), initial_balance)

        # Mark as Successful -> Balance now deducts 500
        txn.status = 'Successful'
        txn.save()
        self.assertEqual(BalanceService.get_account_balance(account), initial_balance - Decimal('500.00'))

    # TC-10: Transaction Deletion and Immediate Balance Update (FR-TXN-03)
    def test_10_transaction_deletion_updates_balance(self):
        account = self.user.accounts.get(last4='2874')
        initial_balance = BalanceService.get_account_balance(account)

        # Create expense
        txn = Transaction.objects.create(
            user=self.user,
            account=account,
            name='Refundable Purchase',
            kind='expense',
            amount=Decimal('250.00'),
            date=datetime.date.today(),
            time=datetime.time(14, 0),
            status='Successful'
        )
        self.assertEqual(BalanceService.get_account_balance(account), initial_balance - Decimal('250.00'))

        # Delete transaction via API
        del_res = self.client.delete(f'/api/v1/transactions/{txn.id}/', **self.auth_headers)
        self.assertEqual(del_res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(BalanceService.get_account_balance(account), initial_balance)

    # TC-11: Quick-Add Petty Expense Creation & Account Deduction
    def test_11_quick_add_petty_expense_creation_deduction(self):
        account = self.user.accounts.get(last4='0000') # Cash
        initial_balance = BalanceService.get_account_balance(account)

        res = self.client.post('/api/v1/petty-expenses/', {
            'name': 'Client Cappuccino',
            'amount': '12.50',
            'date': '2024-07-08',
            'time': '10:15:00',
            'account': account.id,
            'notes': 'Coffee chat'
        }, format='json', **self.auth_headers)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['is_petty'])
        self.assertEqual(res.data['status'], 'Successful')
        # Balance deducted
        self.assertEqual(BalanceService.get_account_balance(account), initial_balance - Decimal('12.50'))

    # TC-12: Petty Expenses Synchronized to Dashboard (FR-PETTY-12)
    def test_12_petty_expenses_synchronized_to_dashboard(self):
        Transaction.objects.create(
            user=self.user,
            name='Office Sticky Notes',
            kind='expense',
            amount=Decimal('8.75'),
            date=datetime.date.today(),
            time=datetime.time(16, 0),
            is_petty=True,
            status='Successful'
        )
        res = self.client.get('/api/v1/transactions/?is_petty=true', **self.auth_headers)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        items = res.data.get('results', res.data)
        names = [i['name'] for i in items]
        self.assertIn('Office Sticky Notes', names)

    # TC-13: Petty Budget and Warning Threshold (80% & 100%) Calculation (FR-PETTY-11)
    def test_13_petty_budget_warning_thresholds(self):
        cur_month = datetime.date.today().strftime('%Y-%m')
        # Set budget to $100
        self.client.post('/api/v1/petty-expenses/budget/', {
            'month': cur_month,
            'amount': '100.00'
        }, format='json', **self.auth_headers)

        # Clear existing petty for this month to test precise thresholds
        Transaction.objects.filter(user=self.user, is_petty=True, date__startswith=cur_month).delete()

        # Add $85 spend -> 85% used -> warning alert
        Transaction.objects.create(
            user=self.user,
            name='Parking pass',
            kind='expense',
            amount=Decimal('85.00'),
            date=datetime.date.today(),
            time=datetime.time(9, 0),
            is_petty=True,
            status='Successful'
        )
        res1 = self.client.get(f'/api/v1/petty-expenses/summary/?month={cur_month}', **self.auth_headers)
        self.assertEqual(res1.data['budget']['alert_status'], 'warning')
        self.assertEqual(res1.data['budget']['percentage_used'], 85.0)

        # Add $20 more -> 105% used -> exceeded alert
        Transaction.objects.create(
            user=self.user,
            name='Stationery',
            kind='expense',
            amount=Decimal('20.00'),
            date=datetime.date.today(),
            time=datetime.time(10, 0),
            is_petty=True,
            status='Successful'
        )
        res2 = self.client.get(f'/api/v1/petty-expenses/summary/?month={cur_month}', **self.auth_headers)
        self.assertEqual(res2.data['budget']['alert_status'], 'exceeded')

    # TC-14: Petty Expenses CSV Export (FR-PETTY-10)
    def test_14_petty_expenses_csv_export(self):
        res = self.client.get('/api/v1/petty-expenses/export/', **self.auth_headers)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res['Content-Type'], 'text/csv')
        content = res.content.decode('utf-8')
        self.assertIn('Reference ID,Title,Category,Date,Time,Amount', content)

    # TC-15: Account Creation and Limitation Adjustment (FR-BAL-05, FR-DASH-21)
    def test_15_account_creation_and_limit_adjustment(self):
        # Create account
        create_res = self.client.post('/api/v1/accounts/', {
            'name': 'Corporate Travel Card',
            'type': 'Mastercard',
            'last4': '4411',
            'payment_mode': 'Direct Debits',
            'opening_balance': '2000.00',
            'monthly_limit': '5000.00',
            'monthly_fee': '15.00'
        }, format='json', **self.auth_headers)
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        acc_id = create_res.data['id']

        # Edit limitation
        patch_res = self.client.patch(f'/api/v1/accounts/{acc_id}/', {
            'monthly_limit': '8500.00',
            'monthly_fee': '18.50'
        }, format='json', **self.auth_headers)
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(patch_res.data['monthly_limit'])), Decimal('8500.00'))

    # TC-16: Inter-Account Transfer Linked Debit & Credit (FR-BAL-10)
    def test_16_inter_account_transfer_linked_debit_credit(self):
        acc1 = self.user.accounts.get(last4='2874')
        acc2 = self.user.accounts.get(last4='9102')

        bal1_before = BalanceService.get_account_balance(acc1)
        bal2_before = BalanceService.get_account_balance(acc2)

        res = self.client.post('/api/v1/accounts/transfer/', {
            'from_account': acc1.id,
            'to_account': acc2.id,
            'amount': '350.00',
            'notes': 'Checking to Savings Transfer'
        }, format='json', **self.auth_headers)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('Transfer completed successfully', res.data['message'])

        # Check balance adjustments
        bal1_after = BalanceService.get_account_balance(acc1)
        bal2_after = BalanceService.get_account_balance(acc2)

        self.assertEqual(bal1_after, bal1_before - Decimal('350.00'))
        self.assertEqual(bal2_after, bal2_before + Decimal('350.00'))

    # TC-17: Account Deactivation Safe Retention (SRS 5.3)
    def test_17_account_deactivation_safe_retention(self):
        account = self.user.accounts.get(last4='2874')
        self.assertTrue(account.transactions.exists())

        # Attempt deletion
        del_res = self.client.delete(f'/api/v1/accounts/{account.id}/', **self.auth_headers)
        self.assertEqual(del_res.status_code, status.HTTP_204_NO_CONTENT)

        # Account must still exist in DB, but with is_active = False
        account.refresh_from_db()
        self.assertFalse(account.is_active)

    # TC-18: Balance History Ledger with Running Balance Column (FR-BAL-08)
    def test_18_balance_history_ledger_running_balance(self):
        res = self.client.get('/api/v1/balance/history/', **self.auth_headers)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get('results', [])
        self.assertGreater(len(results), 0)
        # Running balance present on every row
        for item in results:
            self.assertIn('running_balance', item)
            self.assertIsInstance(item['running_balance'], float)

    # TC-19: Category Deletion with Reassignment Enforcement (FR-CAT-02)
    def test_19_category_deletion_with_reassignment_enforcement(self):
        cat_old = Category.objects.create(user=self.user, name='Subscription Services', kind='expense')
        cat_new = Category.objects.create(user=self.user, name='General Utilities', kind='expense')

        # Link a transaction to cat_old
        Transaction.objects.create(
            user=self.user,
            name='SaaS Software License',
            category=cat_old,
            amount=Decimal('49.00'),
            date=datetime.date.today(),
            time=datetime.time(12, 0)
        )

        # Attempt delete without reassign_to
        fail_res = self.client.delete(f'/api/v1/categories/{cat_old.id}/', **self.auth_headers)
        self.assertEqual(fail_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('reassignment', fail_res.data['error'].lower())

        # Delete with reassignment
        success_res = self.client.delete(
            f'/api/v1/categories/{cat_old.id}/',
            data={'reassign_to': cat_new.id},
            format='json',
            **self.auth_headers
        )
        self.assertEqual(success_res.status_code, status.HTTP_204_NO_CONTENT)
        # Transaction reassigned
        self.assertEqual(Transaction.objects.get(name='SaaS Software License').category, cat_new)

    # TC-20: Notifications Retrieval and Mark as Read
    def test_20_notifications_lifecycle(self):
        notif = Notification.objects.create(
            user=self.user,
            title='Security Alert',
            message='New device logged in',
            type='alert',
            is_read=False
        )

        # Get list
        res = self.client.get('/api/v1/notifications/', **self.auth_headers)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(res.data['unread_count'], 1)

        # Mark read
        read_res = self.client.post(f'/api/v1/notifications/{notif.id}/read/', {}, **self.auth_headers)
        self.assertEqual(read_res.status_code, status.HTTP_200_OK)
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)
