import csv
import datetime
from decimal import Decimal
from django.http import HttpResponse
from django.db.models import Sum, Avg, Max, Count, Q
from django.utils import timezone
from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from transactions.models import Transaction, Category
from transactions.serializers import TransactionSerializer
from accounts.models import Account
from .models import PettyBudget
from .serializers import PettyBudgetSerializer

class PettyExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = Transaction.objects.filter(user=self.request.user, is_petty=True)
        params = self.request.query_params

        # Search
        search = params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(reference_id__icontains=search) | Q(notes__icontains=search))

        # Category
        cat = params.get('category')
        if cat:
            qs = qs.filter(category_id=cat)

        # Payment source / account
        acc = params.get('account')
        if acc:
            qs = qs.filter(account_id=acc)

        # Date range
        start_date = params.get('start_date')
        if start_date:
            qs = qs.filter(date__gte=start_date)
        end_date = params.get('end_date')
        if end_date:
            qs = qs.filter(date__lte=end_date)

        # Amount range
        min_amount = params.get('min_amount')
        if min_amount:
            qs = qs.filter(amount__gte=min_amount)
        max_amount = params.get('max_amount')
        if max_amount:
            qs = qs.filter(amount__lte=max_amount)

        # Sorting
        sort_by = params.get('sort_by', '-date')
        valid_sorts = ['date', '-date', 'amount', '-amount', 'name', '-name']
        if sort_by in valid_sorts:
            if sort_by.endswith('date'):
                qs = qs.order_by(sort_by, '-time')
            else:
                qs = qs.order_by(sort_by)
        else:
            qs = qs.order_by('-date', '-time')

        return qs

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            is_petty=True,
            kind='expense',
            status='Successful'
        )

class PettyExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user, is_petty=True)

class PettyExpenseSummaryView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        cur_month = now.strftime('%Y-%m')

        # Filter by month or query param
        month_param = request.query_params.get('month')
        
        # All petty expenses for current user
        base_qs = Transaction.objects.filter(
            user=user,
            is_petty=True,
            status='Successful'
        )

        if month_param:
            qs = base_qs.filter(date__startswith=month_param)
        else:
            # Check current month, if empty fallback to all or latest active
            cur_month_qs = base_qs.filter(date__startswith=cur_month)
            if cur_month_qs.exists():
                qs = cur_month_qs
                month_param = cur_month
            else:
                qs = base_qs
                month_param = cur_month

        agg = qs.aggregate(
            total=Sum('amount'),
            count=Count('id'),
            avg=Avg('amount'),
            highest=Max('amount')
        )

        total_spend = agg['total'] or Decimal('0.00')
        count = agg['count'] or 0
        avg_spend = agg['avg'] or Decimal('0.00')
        highest_spend = agg['highest'] or Decimal('0.00')

        # Category-wise breakdown for charts
        cat_breakdown = []
        cat_groups = qs.values('category__name').annotate(cat_total=Sum('amount')).order_by('-cat_total')
        for item in cat_groups:
            cname = item['category__name'] or 'Uncategorized'
            cat_breakdown.append({
                'category': cname,
                'amount': float(item['cat_total'])
            })

        # Budget information
        budget_obj = PettyBudget.objects.filter(user=user, month=month_param).first()
        budget_amount = budget_obj.amount if budget_obj else Decimal('1000.00')

        pct_used = round((float(total_spend) / float(budget_amount)) * 100, 1) if budget_amount > 0 else 0.0

        alert_status = 'normal'
        if pct_used >= 100:
            alert_status = 'exceeded'
        elif pct_used >= 80:
            alert_status = 'warning'

        return Response({
            'month': month_param,
            'total_spend': float(total_spend),
            'entry_count': count,
            'average_spend': round(float(avg_spend), 2),
            'highest_spend': float(highest_spend),
            'category_breakdown': cat_breakdown,
            'budget': {
                'amount': float(budget_amount),
                'spent': float(total_spend),
                'remaining': float(max(Decimal('0.00'), budget_amount - total_spend)),
                'percentage_used': pct_used,
                'alert_status': alert_status,
                'message': (
                    "Warning: Petty budget reached 100%!" if alert_status == 'exceeded'
                    else "Alert: Petty budget reached 80% threshold!" if alert_status == 'warning'
                    else "Within budget limits."
                )
            }
        })

class PettyBudgetUpdateView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        now = timezone.now()
        month = request.data.get('month', now.strftime('%Y-%m'))
        amount = request.data.get('amount')

        try:
            amt_dec = Decimal(str(amount))
            if amt_dec <= 0:
                return Response({'error': 'Budget amount must be positive.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'error': 'Invalid budget amount.'}, status=status.HTTP_400_BAD_REQUEST)

        budget_obj, _ = PettyBudget.objects.update_or_create(
            user=user,
            month=month,
            defaults={'amount': amt_dec}
        )
        return Response(PettyBudgetSerializer(budget_obj).data)

class PettyExpenseExportView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = Transaction.objects.filter(user=user, is_petty=True).order_by('-date', '-time')

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="petty_expenses_{datetime.date.today()}.csv"'

        writer = csv.writer(response)
        writer.writerow(['Reference ID', 'Title', 'Category', 'Date', 'Time', 'Amount', 'Payment Source', 'Status', 'Notes'])

        for item in qs:
            writer.writerow([
                item.reference_id,
                item.name,
                item.category.name if item.category else '',
                str(item.date),
                str(item.time),
                f"{item.amount:.2f}",
                item.account.name if item.account else 'Cash',
                item.status,
                item.notes
            ])

        return response
