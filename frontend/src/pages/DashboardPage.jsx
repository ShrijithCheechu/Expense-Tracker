import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import StatisticsCard from '../components/dashboard/StatisticsCard';
import TotalBalanceCard from '../components/dashboard/TotalBalanceCard';
import TransactionsCard from '../components/dashboard/TransactionsCard';
import ExpenseCategoriesCard from '../components/dashboard/ExpenseCategoriesCard';

import AddTransactionModal from '../components/modals/AddTransactionModal';
import EditLimitationModal from '../components/modals/EditLimitationModal';
import AddCardModal from '../components/modals/AddCardModal';
import ManageCategoriesModal from '../components/modals/ManageCategoriesModal';
import FilterModal from '../components/modals/FilterModal';
import TransactionDetailsModal from '../components/modals/TransactionDetailsModal';

import { api } from '../services/api';

export default function DashboardPage() {
  const [period, setPeriod] = useState('Weekly');
  const [selectedDate, setSelectedDate] = useState('2024-04-16');
  const [summaryData, setSummaryData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [addTxnKind, setAddTxnKind] = useState('expense');
  const [showEditLimit, setShowEditLimit] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({});
  const [viewingTxn, setViewingTxn] = useState(null);
  const [editingTxn, setEditingTxn] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');

  const loadDashboardData = async () => {
    try {
      const [sumRes, txnsRes, catsRes, accsRes] = await Promise.all([
        api.getDashboardSummary(period.toLowerCase(), selectedDate),
        api.getTransactions(filters),
        api.getCategories(),
        api.getAccounts()
      ]);
      setSummaryData(sumRes);
      setTransactions(txnsRes.results || txnsRes || []);
      setCategories(catsRes.results || catsRes || []);
      setAccounts(accsRes.results || accsRes || []);
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [period, selectedDate, filters]);

  const handleTxnSuccess = () => {
    loadDashboardData();
  };

  const handleDeleteTxn = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.deleteTransaction(id);
        loadDashboardData();
      } catch (err) {
        alert(err.message || 'Failed to delete transaction');
      }
    }
  };

  // Filtered transactions for global search
  const visibleTransactions = transactions.filter(t => {
    if (!globalSearch) return true;
    const q = globalSearch.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.reference_id?.toLowerCase().includes(q) ||
      t.notes?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout
      title="Dashboard Overview"
      subtitle="Financial security report"
      period={period}
      onPeriodChange={setPeriod}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      searchTerm={globalSearch}
      onSearchChange={setGlobalSearch}
    >
      {/* 2x2 Grid matching reference screenshot exactly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top-Left: Statistics Card */}
        <StatisticsCard
          data={summaryData?.statistics}
          period={period}
          onPeriodChange={setPeriod}
        />

        {/* Top-Right: Total Balance Card */}
        <TotalBalanceCard
          primaryCard={summaryData?.primary_card}
          totalBalance={summaryData?.total_balance}
          onOpenAddCard={() => setShowAddCard(true)}
          onOpenEditLimit={() => setShowEditLimit(true)}
          onSendMoney={() => {
            setAddTxnKind('expense');
            setShowAddTxn(true);
          }}
          onRequestMoney={() => {
            setAddTxnKind('income');
            setShowAddTxn(true);
          }}
        />

        {/* Bottom-Left: Transactions Card */}
        <TransactionsCard
          transactions={visibleTransactions}
          onAddTransaction={() => {
            setAddTxnKind('expense');
            setShowAddTxn(true);
          }}
          onEditTransaction={(txn) => {
            setEditingTxn(txn);
            setShowAddTxn(true);
          }}
          onDeleteTransaction={handleDeleteTxn}
          onViewDetails={(txn) => setViewingTxn(txn)}
          onOpenFilter={() => setShowFilter(true)}
        />

        {/* Bottom-Right: Expense Categories Card */}
        <ExpenseCategoriesCard
          data={summaryData?.expense_categories}
          onOpenSettings={() => setShowCategories(true)}
        />
      </div>

      {/* Modals */}
      {showAddTxn && (
        <AddTransactionModal
          initialKind={addTxnKind}
          defaultAccount={summaryData?.primary_card}
          onClose={() => {
            setShowAddTxn(false);
            setEditingTxn(null);
          }}
          onSuccess={handleTxnSuccess}
        />
      )}

      {showEditLimit && summaryData?.primary_card && (
        <EditLimitationModal
          account={summaryData.primary_card}
          onClose={() => setShowEditLimit(false)}
          onSuccess={handleTxnSuccess}
        />
      )}

      {showAddCard && (
        <AddCardModal
          onClose={() => setShowAddCard(false)}
          onSuccess={handleTxnSuccess}
        />
      )}

      {showCategories && (
        <ManageCategoriesModal
          onClose={() => setShowCategories(false)}
          onCategoriesUpdated={loadDashboardData}
        />
      )}

      {showFilter && (
        <FilterModal
          filters={filters}
          categories={categories}
          accounts={accounts}
          onApply={setFilters}
          onClose={() => setShowFilter(false)}
        />
      )}

      {viewingTxn && (
        <TransactionDetailsModal
          transaction={viewingTxn}
          onClose={() => setViewingTxn(null)}
        />
      )}
    </Layout>
  );
}
