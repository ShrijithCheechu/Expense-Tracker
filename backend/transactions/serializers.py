from rest_framework import serializers
from .models import Category, Transaction
from accounts.models import Account

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'kind', 'icon']

class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)
    account_last4 = serializers.CharField(source='account.last4', read_only=True)
    account_type = serializers.CharField(source='account.type', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'reference_id', 'name', 'kind', 'category', 'category_name',
            'category_icon', 'amount', 'date', 'time', 'status',
            'account', 'account_name', 'account_last4', 'account_type',
            'notes', 'is_petty', 'receipt', 'created_at', 'updated_at'
        ]
        read_only_fields = ['reference_id', 'created_at', 'updated_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be a positive number.")
        return value
