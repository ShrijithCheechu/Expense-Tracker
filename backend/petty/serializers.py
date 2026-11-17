from rest_framework import serializers
from .models import PettyBudget
from transactions.serializers import TransactionSerializer

class PettyBudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = PettyBudget
        fields = ['id', 'month', 'amount', 'created_at']
