import csv
import datetime
from decimal import Decimal
from dateutil.relativedelta import relativedelta
from django.http import HttpResponse
from django.db.models import Sum, Q
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.models import Account
from accounts.serializers import AccountSerializer
from transactions.models import Transaction
from transactions.serializers import TransactionSerializer
from .services import BalanceService

class BalanceSummaryView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        period = request.query_params.get('period', 'monthly').lower()
        ref_date = datetime.date.today()

        if period == 'daily':
            start_date = ref_date
            end_date = ref_date
            prev_start = ref_date - datetime.timedelta(days=1)
            prev_end = prev_start
        elif period == 'yearly':
            start_date = datetime.date(ref_date.year, 1, 1)
            end_date = datetime.date(ref_date.year, 12, 31)
            prev_start = datetime.date(ref_date.year - 1, 1, 1)
            prev_end = datetime.date(ref_date.year - 1, 12, 31)
        elif period == 'weekly':
            start_date = ref_date - datetime.timedelta(days=6)
            end_date = ref_date
            prev_start = start_date - datetime.timedelta(days=7)
            prev_end = start_date - datetime.timedelta(days=1)
        else:  # monthly
            start_date = ref_date.replace(day=1)
            next_month = start_date + relativedelta(months=1)
            end_date = next_month - datetime.timedelta(days=1)
            prev_start = start_date - relativedelta(months=1)
            prev_end = start_date - datetime.timedelta(days=1)

        # Current period figures (Successful only)
        curr_txns = Transaction.objects.filter(user=user, date__range=[start_date, end_date], status='Successful')
        curr_income = curr_txns.filter(kind='income').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        curr_expense = curr_txns.filter(kind='expense').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        curr_net = curr_income - curr_expense

        # Previous period figures
        prev_txns = Transaction.objects.filter(user=user, date__range=[prev_start, prev_end], status='Successful')
        prev_income = prev_txns.filter(kind='income').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        prev_expense = prev_txns.filter(kind='expense').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        prev_net = prev_income - prev_expense

        income_pct = BalanceService.calculate_percentage_change(curr_income, prev_income)
        expense_pct = BalanceService.calculate_percentage_change(curr_expense, prev_expense)
        net_pct = BalanceService.calculate_percentage_change(curr_net, prev_net)

        total_balance = BalanceService.get_total_balance(user)

        # Accounts breakdown
        accounts = Account.objects.filter(user=user, is_active=True).order_by('-is_primary', 'id')
        acc_data = []
        for acc in accounts:
            cur_bal = BalanceService.get_account_balance(acc)
            limit = acc.monthly_limit
            pct_used = round((float(cur_bal) / float(limit)) * 100, 1) if limit > 0 else 0.0
            acc_data.append({
                'id': acc.id,
                'name': acc.name,
                'type': acc.type,
                'last4': acc.last4,
                'payment_mode': acc.payment_mode,
                'opening_balance': float(acc.opening_balance),
                'monthly_limit': float(acc.monthly_limit),
                'monthly_fee': float(acc.monthly_fee),
                'current_balance': float(cur_bal),
                'is_primary': acc.is_primary,
                'limit_percentage': min(100.0, pct_used),
                'status_warning': cur_bal < Decimal('500.00') or cur_bal > limit
            })

        return Response({
            'total_balance': float(total_balance),
            'currency': user.currency or '$',
            'period': period,
            'summary_tiles': {
                'income': {'total': float(curr_income), 'change': income_pct},
                'expense': {'total': float(curr_expense), 'change': expense_pct},
                'net_savings': {'total': float(curr_net), 'change': net_pct},
            },
            'accounts': acc_data
        })

class BalanceTrendView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        period = request.query_params.get('period', 'monthly')
        
        # Build 12 intervals or last 7 days depending on period
        now = datetime.date.today()
        trend_points = []
        comparison_points = []

        if period == 'weekly':
            for i in range(6, -1, -1):
                d = now - datetime.timedelta(days=i)
                txns_up_to = Transaction.objects.filter(user=user, date__lte=d, status='Successful')
                inc_up_to = txns_up_to.filter(kind='income').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
                exp_up_to = txns_up_to.filter(kind='expense').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
                
                # Base opening balance sum
                open_sum = Account.objects.filter(user=user, is_active=True).aggregate(t=Sum('opening_balance'))['t'] or Decimal('0.00')
                day_balance = open_sum + inc_up_to - exp_up_to

                # Daily income & expense
                day_txns = Transaction.objects.filter(user=user, date=d, status='Successful')
                day_inc = day_txns.filter(kind='income').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
                day_exp = day_txns.filter(kind='expense').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

                trend_points.append({
                    'label': d.strftime('%a'),
                    'date': str(d),
                    'balance': float(day_balance)
                })
                comparison_points.append({
                    'label': d.strftime('%a'),
                    'income': float(day_inc),
                    'expense': float(day_exp)
                })
        else:
            # 6 months trend
            for i in range(5, -1, -1):
                m_date = now - relativedelta(months=i)
                m_start = m_date.replace(day=1)
                m_next = m_start + relativedelta(months=1)
                m_end = m_next - datetime.timedelta(days=1)

                txns_up_to = Transaction.objects.filter(user=user, date__lte=m_end, status='Successful')
                inc_up_to = txns_up_to.filter(kind='income').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
                exp_up_to = txns_up_to.filter(kind='expense').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
                open_sum = Account.objects.filter(user=user, is_active=True).aggregate(t=Sum('opening_balance'))['t'] or Decimal('0.00')
                m_balance = open_sum + inc_up_to - exp_up_to

                m_txns = Transaction.objects.filter(user=user, date__range=[m_start, m_end], status='Successful')
                m_inc = m_txns.filter(kind='income').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
                m_exp = m_txns.filter(kind='expense').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

                trend_points.append({
                    'label': m_date.strftime('%b'),
                    'date': m_date.strftime('%Y-%m'),
                    'balance': float(m_balance)
                })
                comparison_points.append({
                    'label': m_date.strftime('%b'),
                    'income': float(m_inc),
                    'expense': float(m_exp)
                })

        return Response({
            'trend': trend_points,
            'income_vs_expense': comparison_points
        })

class BalanceHistoryTableView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        FR-BAL-08: A balance history table shall list transactions affecting the balance with a running balance column, with search, filter, and pagination.
        """
        user = request.user
        qs = Transaction.objects.filter(user=user, status='Successful').order_by('date', 'time', 'id')

        # Filter params
        search = request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(reference_id__icontains=search))
        acc_id = request.query_params.get('account')
        if acc_id:
            qs = qs.filter(account_id=acc_id)

        # Compute running balances from opening balances
        open_balance = Account.objects.filter(user=user, is_active=True).aggregate(t=Sum('opening_balance'))['t'] or Decimal('0.00')
        running = open_balance

        history_items = []
        for txn in qs:
            if txn.kind == 'income':
                running += txn.amount
            else:
                running -= txn.amount

            history_items.append({
                'id': txn.id,
                'reference_id': txn.reference_id,
                'name': txn.name,
                'kind': txn.kind,
                'category': txn.category.name if txn.category else 'General',
                'amount': float(txn.amount),
                'date': str(txn.date),
                'time': str(txn.time),
                'account': txn.account.name if txn.account else 'Cash',
                'running_balance': float(running),
                'is_petty': txn.is_petty
            })

        # Return latest first
        history_items.reverse()

        # Simple pagination
        page = int(request.query_params.get('page', 1))
        page_size = 10
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        return Response({
            'count': len(history_items),
            'page': page,
            'total_pages': (len(history_items) + page_size - 1) // page_size or 1,
            'results': history_items[start_idx:end_idx]
        })

class BalanceExportView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = Transaction.objects.filter(user=user, status='Successful').order_by('-date', '-time')

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="balance_report_{datetime.date.today()}.csv"'

        writer = csv.writer(response)
        writer.writerow(['Reference ID', 'Transaction Name', 'Type', 'Amount', 'Date', 'Time', 'Account', 'Status'])

        for t in qs:
            writer.writerow([
                t.reference_id,
                t.name,
                t.kind,
                f"{t.amount:.2f}",
                str(t.date),
                str(t.time),
                t.account.name if t.account else 'Cash',
                t.status
            ])

        return response
