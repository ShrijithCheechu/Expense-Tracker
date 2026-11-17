from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from accounts.views import (
    RegisterView, DemoLoginView, UserProfileView,
    AccountListCreateView, AccountDetailView, AccountTransferView
)
from transactions.views import (
    TransactionListCreateView, TransactionDetailView,
    CategoryListCreateView, CategoryDetailView,
    DashboardSummaryView
)
from petty.views import (
    PettyExpenseListCreateView, PettyExpenseDetailView,
    PettyExpenseSummaryView, PettyExpenseExportView, PettyBudgetUpdateView
)
from balance.views import (
    BalanceSummaryView, BalanceTrendView,
    BalanceHistoryTableView, BalanceExportView
)
from notifications.views import (
    NotificationListView, NotificationMarkReadView, NotificationMarkAllReadView
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication
    path('api/v1/auth/register/', RegisterView.as_view(), name='register'),
    path('api/v1/auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('api/v1/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/demo-login/', DemoLoginView.as_view(), name='demo_login'),
    path('api/v1/auth/profile/', UserProfileView.as_view(), name='profile'),

    # Dashboard
    path('api/v1/dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),

    # Transactions
    path('api/v1/transactions/', TransactionListCreateView.as_view(), name='transactions_list_create'),
    path('api/v1/transactions/<int:pk>/', TransactionDetailView.as_view(), name='transaction_detail'),

    # Categories
    path('api/v1/categories/', CategoryListCreateView.as_view(), name='categories_list_create'),
    path('api/v1/categories/<int:pk>/', CategoryDetailView.as_view(), name='category_detail'),

    # Petty Expenses
    path('api/v1/petty-expenses/', PettyExpenseListCreateView.as_view(), name='petty_list_create'),
    path('api/v1/petty-expenses/<int:pk>/', PettyExpenseDetailView.as_view(), name='petty_detail'),
    path('api/v1/petty-expenses/summary/', PettyExpenseSummaryView.as_view(), name='petty_summary'),
    path('api/v1/petty-expenses/export/', PettyExpenseExportView.as_view(), name='petty_export'),
    path('api/v1/petty-expenses/budget/', PettyBudgetUpdateView.as_view(), name='petty_budget_update'),

    # Accounts
    path('api/v1/accounts/', AccountListCreateView.as_view(), name='accounts_list_create'),
    path('api/v1/accounts/<int:pk>/', AccountDetailView.as_view(), name='account_detail'),
    path('api/v1/accounts/transfer/', AccountTransferView.as_view(), name='account_transfer'),

    # Balance
    path('api/v1/balance/summary/', BalanceSummaryView.as_view(), name='balance_summary'),
    path('api/v1/balance/trend/', BalanceTrendView.as_view(), name='balance_trend'),
    path('api/v1/balance/history/', BalanceHistoryTableView.as_view(), name='balance_history'),
    path('api/v1/balance/export/', BalanceExportView.as_view(), name='balance_export'),

    # Notifications
    path('api/v1/notifications/', NotificationListView.as_view(), name='notifications_list'),
    path('api/v1/notifications/<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification_read'),
    path('api/v1/notifications/mark-all-read/', NotificationMarkAllReadView.as_view(), name='notification_mark_all_read'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
