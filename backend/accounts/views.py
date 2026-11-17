from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from decimal import Decimal
import datetime

from .models import User, Account
from .serializers import UserSerializer, RegisterSerializer, AccountSerializer
from transactions.models import Transaction, Category
from common_seed import seed_user_data

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        seed_user_data(user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)

class DemoLoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = 'alex.morgan@fintech.io'
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'name': 'Alex Morgan',
                'currency': '$',
                'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
            }
        )
        if created:
            user.set_password('demo12345')
            user.save()
        seed_user_data(user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class AccountListCreateView(generics.ListCreateAPIView):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Account.objects.filter(user=self.request.user, is_active=True).order_by('-is_primary', 'name')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Account.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        # SRS 5.3: Deleting an account with transactions shall deactivate it rather than remove history
        if instance.transactions.exists():
            instance.is_active = False
            instance.save()
        else:
            instance.delete()

class AccountTransferView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        SRS FR-BAL-10: Transfer an amount between own accounts, creating linked debit and credit entries.
        """
        source_id = request.data.get('from_account')
        target_id = request.data.get('to_account')
        amount_val = request.data.get('amount')
        notes = request.data.get('notes', 'Account transfer')

        try:
            amount = Decimal(str(amount_val))
            if amount <= 0:
                return Response({'error': 'Amount must be positive.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'error': 'Invalid amount.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            source_acc = Account.objects.get(id=source_id, user=request.user)
            target_acc = Account.objects.get(id=target_id, user=request.user)
        except Account.DoesNotExist:
            return Response({'error': 'Account not found.'}, status=status.HTTP_404_NOT_FOUND)

        if source_acc.id == target_acc.id:
            return Response({'error': 'Source and destination accounts must be different.'}, status=status.HTTP_400_BAD_REQUEST)

        now = datetime.datetime.now()
        date_today = now.date()
        time_now = now.time()

        transfer_cat, _ = Category.objects.get_or_create(
            user=request.user,
            name='Transfer',
            defaults={'kind': 'expense', 'icon': 'ArrowRightLeft'}
        )

        debit_txn = Transaction.objects.create(
            user=request.user,
            account=source_acc,
            category=transfer_cat,
            name=f"Transfer to {target_acc.name}",
            kind='expense',
            amount=amount,
            date=date_today,
            time=time_now,
            status='Successful',
            notes=notes
        )

        credit_txn = Transaction.objects.create(
            user=request.user,
            account=target_acc,
            category=transfer_cat,
            name=f"Transfer from {source_acc.name}",
            kind='income',
            amount=amount,
            date=date_today,
            time=time_now,
            status='Successful',
            notes=notes,
            transfer_counterpart=debit_txn
        )

        debit_txn.transfer_counterpart = credit_txn
        debit_txn.save()

        return Response({
            'message': 'Transfer completed successfully.',
            'debit': debit_txn.id,
            'credit': credit_txn.id
        })
