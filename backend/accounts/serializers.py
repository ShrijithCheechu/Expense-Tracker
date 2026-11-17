from rest_framework import serializers
from .models import User, Account
from balance.services import BalanceService

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'avatar', 'currency']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            name=validated_data.get('name', ''),
            password=validated_data['password']
        )
        return user

class AccountSerializer(serializers.ModelSerializer):
    current_balance = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = [
            'id', 'name', 'type', 'last4', 'payment_mode',
            'opening_balance', 'monthly_limit', 'monthly_fee',
            'is_active', 'is_primary', 'created_at', 'current_balance'
        ]

    def get_current_balance(self, obj):
        return BalanceService.get_account_balance(obj)
