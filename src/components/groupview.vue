<template>
  <navigation/>

  <div class="con">
    <div class="nav-con">
      <h1><i class="fa fa-coins"></i>  Group Expenses</h1>
    </div>

    <button @click="showGroupModal = true" class="show-groups-button">
      <i class="fas fa-users"></i> View Your Groups
    </button>

    <!-- Group List Modal -->
    <div v-if="showGroupModal" class="group-modal-overlay">
      <div class="group-modal">
        <div class="group-modal-header">
          <h3>Your Groups</h3>
          <button @click="showGroupModal = false" class="close-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="group-modal-content">
          <div v-if="userGroupsLoading" class="loading-groups">
            <div class="spinner small"></div>
            <span>Loading your groups...</span>
          </div>
          
          <div v-else-if="userGroupsError" class="error-message">
            {{ userGroupsError }}
            <button @click="fetchUserGroups" class="retry-btn">Retry</button>
          </div>
          
          <div v-else-if="userGroups.length === 0" class="no-groups">
            <p>You don't have any groups yet.</p>
            <button @click="goToGroupManagement" class="create-group-btn">
              <i class="fas fa-plus"></i> Create Group
            </button>
          </div>
          
    <div v-else class="groups-list">
  <div 
    v-for="group in userGroups" 
    :key="group.id" 
    class="group-item"
    @click="navigateToGroup(group.id)"
  >
    <div class="group-info">
      <h4>{{ group.group_name }}</h4>
      <div class="group-meta">
        <span><i class="fas fa-user-friends"></i> {{ group.member_count }} members</span>
        <span><i class="fas fa-calendar-alt"></i> {{ formatDate(group.created_at) }}</span>
      </div>
    </div>
    <div class="group-actions">
      <i class="fas fa-chevron-right"></i>
    </div>
  </div>
</div>
        </div>
      </div>
    </div>

    
    <div class="con-container">
      <div v-if="$store.state.group.currentGroup" class="current-group">
  <div class="group-line">
    <i class="fas fa-user-friends"></i>
    <h3>{{ $store.state.group.currentGroup.group_name }}</h3>
  </div>
  <div class="group-line">
    <i class="fas fa-key"></i>
    <p>Code: {{ $store.state.group.currentGroup.group_code }}</p>
  </div>
</div>
      <div v-if="currentView === 'view'" class="budget-section">
        <div class="content-wrapper">
          <!-- Filter Buttons -->
          <div class="filter-buttons">
            <div class="member-filter">
    <select v-model="selectedMember" @change="filterByMember" :disabled="memberFilterLoading">
      <option value="all">All Members</option>
      <option v-for="member in groupMembers" :key="member.id" :value="member.id">
        {{ member.username }}
      </option>
    </select>
    <div v-if="memberFilterLoading" class="small-spinner"></div>
  </div>
            <button @click="filterExpenses('Food')" :class="{ active: filterCategory === 'Food' }">Food</button>
            <button @click="filterExpenses('Bill')" :class="{ active: filterCategory === 'Bill' }">Bill</button>
            <button @click="filterExpenses('Transportation')" :class="{ active: filterCategory === 'Transportation' }">Transportation</button>
            <button @click="filterExpenses('Entertainment')" :class="{ active: filterCategory === 'Entertainment' }">Entertainment</button>
            <button @click="filterExpenses('Accomodation')" :class="{ active: filterCategory === 'Accomodation' }">Accomodation</button>
            <button @click="filterExpenses('Shopping')" :class="{ active: filterCategory === 'Shopping' }">Shopping</button>
            <button @click="filterExpenses('Other')" :class="{ active: filterCategory === 'Other' }">Other</button>
            <button @click="filterExpenses('All')" :class="{ active: filterCategory === 'All' }">View All</button>
          </div>

          <!-- Expense Table -->
          <div class="expense-table">
            <h3>
              <span class="category-label">({{ filterCategory === 'All' ? 'All Categories' : filterCategory === 'Other' ? 'Other Categories' : filterCategory }})</span>
            </h3>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Added By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredExpenses.length === 0">
                  <td colspan="5" class="no-expenses-message">
                    NO EXPENSES
                  </td>
                </tr>
                <tr 
                  v-for="(expense, index) in filteredExpenses" 
                  v-else
                  :key="expense.id" 
                  :class="{'alternate-row': index % 2 !== 0}"
                >
                  <td>{{ expense.category }}</td>
                  <td>{{ expense.name }}</td>
                  <td>{{ formatCurrency(expense.amount) }}</td>
                  <td>{{ expense.username }}</td>
                  <td>{{ expense.date }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Display Total Amount -->
          <div class="total-amount">
            <p>Total: {{ formatCurrency(totalAmount) }} ({{ formatUsd(totalAmount) }})</p>
          </div>
          </div>
  </div>
</div>

    <div class="chart-summary">
      <div class="chart">
        <pie-chart :data="chartData" 
                  :options="chartOptions" 
                  style="height: 290px;"/>
        
        <!-- Download button -->
        <div class="download">
          <button class="download-button" @click="generatePDF">Download Report</button>
        </div>
      </div>

      <div class="summary-box">
        <h3>Budget Summary</h3>

        <div class="summary-item">
      <span>Budget:</span>
      <span>{{ formatCurrency(currentBudget?.budget_amount || 0) }}</span>
    </div>

        <div class="summary-item">
          <span>Total Expenses:</span>
          <span>{{ formatCurrency(totalAmount) }}</span>
        </div>

        <div class="summary-item remaining">
      <span>Remaining Budget:</span>
      <span :class="{ 'negative': remainingBudget < 0 }">
        {{ formatCurrency(remainingBudget) }}
      </span>
    </div>

    <div class="progress-bar">
      <div class="progress" 
         :class="{ 'exceeded': isBudgetExceeded }"
         :style="{ width: budgetPercentage + '%' }"></div>
  </div>
  <div class="percentage" :class="{ 'exceeded': isBudgetExceeded }">
    {{ budgetPercentage.toFixed(0) }}%
  </div>
  </div>
  </div>
  <div class="contribution-section">
    <h3>
    <i class="fas fa-hand-holding-usd"></i> 
    {{ filterCategory === 'All' ? 'All Categories' : filterCategory }} Contributions
  </h3>
          <div class="member-contributions-table">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Contributed</th>
                  <th>Share</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in memberContributions" :key="member.id">
  <td>{{ member.username }}</td>
  <td>{{ formatPHP(member.contributed) }}</td>
  <td>{{ formatPHP(member.share) }}</td>
  <td :class="{ 'text-danger': member.balance < 0, 'text-success': member.balance >= 0 }">
    {{ formatPHP(Math.abs(member.balance)) }}
    <span v-if="member.balance < 0">(Owes)</span>
    <span v-else>(Owed)</span>
  </td>
  <td>
    <span :class="['status-badge', member.status]">
      {{ member.status }}
      <span v-if="member.status === 'pending'" class="text-danger"> 
      </span>
    </span>
  </td>
</tr>
              </tbody>
            </table>
          </div>
        </div>
  <div v-if="isBudgetExceeded" class="exceeded-warning">
    ⚠️ {{ currentBudget.budget_name }} exceeded by {{ formatCurrency(exceededAmount) }}
</div>
</div>
</template>

<script>
import Navigation from "./navigation.vue"; 
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { mapGetters, mapActions } from 'vuex';
import axios from 'axios';

ChartJS.register(
  Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, 
  ChartDataLabels 
);

export default {
  components: {
    Navigation,
    PieChart: Pie,
  },
  data() {
    return {
      memberContributions: [],
      contributionsLoading: false,
      showGroupList: false,
      userGroups: [],
      userGroupsLoading: false,
      userGroupsError: null,
      showGroupModal: false,
      groupMembers: [],
      selectedMember: 'all', // Default to show all members
      memberFilterLoading: false,
      currentView: 'view', 
      filterCategory: 'All',
      chartOptions: {
        responsive: true,
        plugins: {
          datalabels: {
      formatter: (value, context) => {
        const dataset = context.chart.data.datasets[0].data;
        const total = dataset.reduce((sum, val) => sum + val, 0);
        const percentage = (value / total * 100);
        
        return percentage >= 0.5 ? percentage.toFixed(1) + '%' : null;
      },
      color: '#000',
      font: function(context) {
        const dataset = context.chart.data.datasets[0].data;
        const total = dataset.reduce((sum, val) => sum + val, 0);
        const percentage = (dataset[context.dataIndex] / total * 100);
        
        
        let size = 12;
        if (percentage <= 5) {
          size = 10;
        }

        return {
          weight: 'bold',
          size: size
        };
      },
      align: function(context) {
  const dataset = context.chart.data.datasets[0].data;
  const total = dataset.reduce((sum, val) => sum + val, 0);
  const value = dataset[context.dataIndex];
  const percentage = (value / total) * 100;

  // Move small labels outside
  return percentage <= 1 ? 'end' : 'center';
},
anchor: function(context) {
  const dataset = context.chart.data.datasets[0].data;
  const total = dataset.reduce((sum, val) => sum + val, 0);
  const value = dataset[context.dataIndex];
  const percentage = (value / total) * 100;

  return percentage <= 1 ? 'end' : 'center';
},
offset: function(context) {
  const dataset = context.chart.data.datasets[0].data;
  const total = dataset.reduce((sum, val) => sum + val, 0);
  const value = dataset[context.dataIndex];
  const percentage = (value / total) * 100;

  return percentage <= 2 ? 10 : 0; // Add space for small slices
},
      padding: 0
          },
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return tooltipItem.label + ': ₱' + tooltipItem.raw.toFixed(2);
              },
            },
          },
        }
      },
    };
  },

  computed: {
    ...mapGetters('group', ['getViewExpenses']),
    
    contributionsByCategory() {
    if (!this.memberContributions.length || !this.expenses.length) return {};
    
    const categories = [...new Set(this.expenses.map(e => e.category))];
    const result = {};
    
    categories.forEach(category => {
      // Calculate total expenses for this category
      const categoryExpenses = this.expenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0);
      
      const memberCount = this.groupMembers.length || 1;
      const sharePerMember = categoryExpenses / memberCount;
      
      result[category] = this.memberContributions.map(member => {
        // Calculate contributions for this category (simple proportional split)
        const contributed = (member.contributed / this.totalAmount) * categoryExpenses;
        const balance = contributed - sharePerMember;
        
        return {
          username: member.username,
          contributed: contributed,
          share: sharePerMember,
          balance: balance,
          status: balance >= 0 ? 'completed' : 'pending'
        };
      });
    });
    
    return result;
  },

    isBudgetExceeded() {
    return this.currentBudget && this.totalAmount > this.currentBudget.budget_amount;
  },
  
  exceededAmount() {
    if (!this.isBudgetExceeded) return 0;
    return this.totalAmount - this.currentBudget.budget_amount;
  },

    currentBudget() {
    return this.$store.state.group.groupBudget;
  },
  
  remainingBudget() {
    if (!this.currentBudget) return 0;
    return this.currentBudget.budget_amount - this.totalAmount;
  },
  
  budgetPercentage() {
    if (!this.currentBudget || this.currentBudget.budget_amount <= 0) return 0;
    
    const percentage = Math.min((this.totalAmount / this.currentBudget.budget_amount) * 100, 100);
    return percentage;
  },
  
    
    usdExchangeRate() {
      return this.$store.state.usdExchangeRate || 0.018045;
    },

    expenses() {   
  const groupExpenses = this.$store.state.group.expenses || [];
  return groupExpenses.map(expense => ({
    ...expense,
    category: expense.expense_type,
    name: expense.item_name,
    amount: Number(expense.item_price),
    date: this.formatDateForView(expense.expense_date),
    username: expense.username || expense.user_name || 'Unknown' // Handle both property names
  }));
},
    
    chartData() {
      const categoryCounts = {
        Food: 0,
        Bill: 0,
        Transportation: 0,
        Entertainment: 0,
        Accommodation: 0, 
        Shopping: 0,
        Other: 0,
      };

      this.filteredExpenses.forEach(expense => {
        const category = expense.category === 'Accomodation' ? 'Accommodation' : expense.category; 
        if (category in categoryCounts) {
          categoryCounts[category] += expense.amount;
        } else {
          categoryCounts.Other += expense.amount;
        }
      });

      return {
        labels: Object.keys(categoryCounts),
        datasets: [{
          label: 'Expense Categories',
          data: Object.values(categoryCounts),
          backgroundColor: [
            '#c5fdfa', '#febee9', '#c9d1fd', '#f5fda3', 
            '#ecbefe', '#c7fbc5', '#feadad', '#adb5fe'
          ],
          borderColor: [
            '#a0f0eb', '#fba9dc', '#a9b3f0', '#e3f484', 
            '#d3a9f5', '#a9e9a7', '#f98b8b', '#8f9ff0'  
          ],
          borderWidth: 1,
        }]
      };
    },

    filteredExpenses() {
      let expenses = this.expenses;
      
      if (this.filterCategory && this.filterCategory !== 'All') {
        expenses = expenses.filter(expense => {
          if (this.filterCategory.toLowerCase() === 'other') {
            const isStandardCategory = [
              'food', 'bill', 'transportation', 
              'entertainment', 'accomodation', 'shopping'
            ].includes(expense.category?.toLowerCase());
            return !isStandardCategory;
          } else {
            const expenseCategory = expense.category ? expense.category.trim().toLowerCase() : '';
            const filterCategory = this.filterCategory ? this.filterCategory.trim().toLowerCase() : '';
            return expenseCategory === filterCategory;
          }
        });
      }

      return expenses;
    },

    totalAmount() {
      return this.filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    }
  },

  watch: {
    expenses: {
    handler() {
      if (this.filterCategory === 'All') {
        this.calculateMemberContributions();
      } else {
        this.updateContributionsByCategory();
      }
    },
    deep: true
  },
  groupMembers: {
    handler() {
      if (this.filterCategory === 'All') {
        this.calculateMemberContributions();
      } else {
        this.updateContributionsByCategory();
      }
    },
    deep: true
  },
  filterCategory: {
    handler(newVal) {
      this.updateContributionsByCategory();
    }
  }
},

  created() {
    this.fetchViewExpenses();
    this.fetchExchangeRate();
    this.fetchUserGroups();
    if (this.$store.state.group.currentGroup) {
    this.$store.dispatch('group/fetchGroupBudget', this.$store.state.group.currentGroup.id);
  }
  },

  methods: {
    ...mapActions(['fetchViewExpenses', 'fetchExchangeRate']),
    
    formatPHP(value) {
    return '₱' + parseFloat(value).toFixed(2);
  },

  async calculateMemberContributions() {
  if (!this.$store.state.group.currentGroup) return;
  
  this.contributionsLoading = true;
  try {
    const groupId = this.$store.state.group.currentGroup.id;
    
    // Fetch all contributions (both completed and pending)
    const contributionsRes = await axios.get(
      `/api/grp_expenses/groups/${groupId}/contributions`, 
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
    
    const contributions = contributionsRes.data?.contributions || [];
    
    // Calculate total expenses
    const totalExpenses = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const memberCount = this.groupMembers.length || 1;
    const equalShare = totalExpenses / memberCount;
    
    // Calculate each member's contribution and balance
    this.memberContributions = this.groupMembers.map(member => {
      // Calculate completed contributions
      const completedContributions = contributions
        .filter(c => c.user_id === member.id && c.status === 'completed')
        .reduce((sum, c) => sum + parseFloat(c.amount), 0);
      
      const pendingContributions = contributions
        .filter(c => c.user_id === member.id && c.status === 'pending')
        .reduce((sum, c) => sum + parseFloat(c.amount), 0);

      const totalContributed = completedContributions + pendingContributions;
     
      const balance = totalContributed - equalShare;
      
     
      const status = completedContributions >= equalShare ? 'completed' : 'pending';
      
      return {
        id: member.id,
        username: member.username,
        contributed: totalContributed, 
        share: equalShare,
        balance: balance,
        status: status,
        pendingAmount: pendingContributions,
        completedAmount: completedContributions
      };
    });
    
  } catch (err) {
    console.error('Error calculating contributions:', err);
  } finally {
    this.contributionsLoading = false;
  }
},

    formatUsd(value) {
      const rate = this.$store.state.usdExchangeRate || 0.018045;
      const usdAmount = parseFloat(value) * rate;
      return `$${usdAmount.toFixed(2)}`;
    },

  filterExpenses(category) {
    this.filterCategory = category;
    this.updateContributionsByCategory();
  },

  updateContributionsByCategory() {
    if (this.filterCategory === 'All') {
      // Use the normal calculation when viewing all categories
      this.calculateMemberContributions();
    } else {
      // For specific categories, use the category-specific calculation
      const categoryData = this.contributionsByCategory[this.filterCategory] || [];
      this.memberContributions = categoryData;
    }
  },

    formatCurrency(value) {
      if (value == null || isNaN(value)) return '₱0.00';
      return '₱' + parseFloat(value).toFixed(2);
    },
    
    formatDateForView(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },

    async fetchGroupMembers(groupId) {
    try {
      const response = await axios.get(`/api/grp_expenses/${groupId}/members`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      });
      
      if (response.data.success) {
        this.groupMembers = response.data.data;
      }
    } catch (err) {
      console.error('Failed to fetch group members:', err);
    }
  },

    async fetchUserGroups() {
      this.userGroupsLoading = true;
      this.userGroupsError = null;
      try {
        const response = await axios.get(`/api/grp_expenses/my-groups`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        });
        
        if (response.data.success) {
          this.userGroups = response.data.data;
        } else {
          this.userGroupsError = response.data.message || 'Failed to load groups';
        }
      } catch (err) {
        this.userGroupsError = err.response?.data?.message || 'Failed to load groups';
        console.error('Failed to fetch user groups:', err);
      } finally {
        this.userGroupsLoading = false;
      }
    },

    async filterByMember() {
    if (this.selectedMember === 'all') {
      // Reset to show all expenses
      await this.$store.dispatch('group/fetchExpenses', {
        groupId: this.$store.state.group.currentGroup.id,
        monthYear: new Date().toISOString().slice(0, 7)
      });
      return;
    }

    this.memberFilterLoading = true;
    try {
      const response = await axios.get(
        `/api/grp_expenses/${this.$store.state.group.currentGroup.id}/expenses/member/${this.selectedMember}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        }
      );

      if (response.data.success) {
      // Transform the expenses data to match your component's format
      const formattedExpenses = response.data.data.map(expense => ({
        ...expense,
        category: expense.expense_type,
        name: expense.item_name,
        amount: Number(expense.item_price),
        date: this.formatDateForView(expense.expense_date),
        username: expense.username
      }));
      
      this.$store.commit('group/SET_EXPENSES', formattedExpenses);
    }
  } catch (err) {
    console.error('Failed to filter by member:', err);
    this.$notify({
      title: 'Error',
      message: 'Failed to fetch member expenses',
      type: 'error'
    });
  } finally {
    this.memberFilterLoading = false;
  }
},

    toggleGroupList() {
      this.showGroupList = !this.showGroupList;
      if (this.showGroupList && this.userGroups.length === 0) {
        this.fetchUserGroups();
      }
    },
    
    async navigateToGroup(groupId) {
  try {
    this.showGroupModal = false; 
    this.$store.commit('group/SET_CURRENT_GROUP_ID', groupId); 
    
    await this.$store.dispatch('group/fetchGroup', groupId);
    await this.$store.dispatch('group/fetchExpenses', { 
      groupId,
      monthYear: new Date().toISOString().slice(0, 7) 
    });
    
    await this.$store.dispatch('group/fetchGroupBudget', groupId);

    await this.fetchGroupMembers(groupId);
    await this.calculateMemberContributions();

    this.selectedMember = 'all';
    this.filterCategory = 'All'; 
    this.fetchViewExpenses(); 
    
  } catch (err) {
    console.error('Failed to navigate to group:', err);
    this.$notify({
      title: 'Error',
      message: 'Failed to load group data',
      type: 'error'
    });
  }
},
    
    goToGroupManagement() {
      this.$router.push('/GC');
    },

    async generatePDF() {
  try {
    const doc = new jsPDF();
    const formatCurrencyForPDF = (value) => {
    return `PHP ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

    
    // Title 
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Expense Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    let filterText = this.filterCategory === 'All' ? 'All Categories' : this.filterCategory;
    doc.text(`${filterText}`, 105, 30, { align: 'center' });

    if (this.remainingBudget < 0) {
      const exceededAmount = Math.abs(this.remainingBudget);
      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0); // Red color for warning
      doc.setFont('helvetica', 'bold');
      doc.text(`Budget Exceeded by ${formatCurrencyForPDF(exceededAmount)}`, 105, 40, { align: 'center' });
      doc.setTextColor(0, 0, 0); // Reset to black
    }
    
    // Budget Summary Section
    doc.setFontSize(14);
    doc.text('Budget Summary', doc.internal.pageSize.getWidth() / 2, 45 + (this.remainingBudget < 0 ? 10 : 0), { 
      align: 'center' 
    });
    
    // Budget Summary Table
    autoTable(doc, {
      startY: 50 + (this.remainingBudget < 0 ? 10 : 0),
      head: [['Metric', 'Amount']],
      body: [
        ['Total Budget', formatCurrencyForPDF(this.currentBudget?.budget_amount || 0)],
        ['Total Expenses', formatCurrencyForPDF(this.totalAmount)],
        ['Remaining Budget', formatCurrencyForPDF(this.remainingBudget)]
      ],
      margin: { left: 10, right: 10, bottom: 20, top: 20  },
      tableWidth: 'wrap',
      horizontalAlign: 'center',
      styles: {
        cellPadding: 4,
        fontSize: 10,
        halign: 'center',
        lineColor: [73, 125, 116],
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 95, fontStyle: 'bold' },
        1: { cellWidth: 95 }
      },
      headStyles: {
        fillColor: [73, 125, 116],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      // Highlight remaining budget if negative
      didDrawCell: (data) => {
        if (data.section === 'body' && data.row.index === 2 && this.remainingBudget < 0) {
          doc.setFillColor(255, 200, 200); // Light red background
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          doc.setTextColor(255, 0, 0); // Red text
          doc.text(data.cell.text, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 2, {
            align: 'center'
          });
        }
      }
    });
    
    // Expense Categories Chart
    doc.setFontSize(14);
    doc.text('Expense Categories Breakdown', doc.internal.pageSize.getWidth() / 2, doc.lastAutoTable.finalY + 15, { align: 'center' });
    
    const categoryData = Object.entries(this.chartData.labels.reduce((acc, label, index) => {
      acc[label] = this.chartData.datasets[0].data[index];
      return acc;
    }, {}));
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Category', 'Amount', 'Percentage']],
      body: categoryData.map(([category, amount]) => [
        category,
        formatCurrencyForPDF(amount),
        `${((amount / this.totalAmount) * 100).toFixed(1)}%`
      ]),
      margin: { left: 10, right: 10, bottom: 20, top: 20  },
      tableWidth: 'wrap',
      horizontalAlign: 'center',
      styles: {
        cellPadding: 4,
        fontSize: 10,
        halign: 'center',
        valign: 'middle',
        lineColor: 	[159, 82, 85]
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 60 },
        2: { cellWidth: 60 }
      },
      headStyles: {
        fillColor: [159, 82, 85],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      }
    });
    
    // Member Contributions Section
    doc.setFontSize(14);
    doc.text('Member Contributions', doc.internal.pageSize.getWidth() / 2, doc.lastAutoTable.finalY + 15, { align: 'center' });
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Member', 'Contributed', 'Share', 'Balance', 'Status']],
      body: this.memberContributions.map(member => [
        member.username,
        formatCurrencyForPDF(member.contributed),
        formatCurrencyForPDF(member.share),
        `${formatCurrencyForPDF(Math.abs(member.balance))} ${member.balance < 0 ? '(Owes)' : '(Owed)'}`,
        member.status
      ]),
      margin: { left: 10, right: 10, bottom: 20, top: 20 },
      tableWidth: 'wrap',
      horizontalAlign: 'center',
      styles: {
        cellPadding: 4,
        fontSize: 9,
        halign: 'center',
        valign: 'middle',
        overflow: 'linebreak',
        
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 45 },
        4: { cellWidth: 25 }
      },
      headStyles: {
        fillColor: [94, 104, 109],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        lineColor: [94, 104, 109]
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        // Color coding for balances
        didDrawCell: (data) => {
          if (data.column.index === 3) { // Balance column
            const cellValue = data.cell.raw;
            const owes = cellValue.includes('(Owes)');
            doc.setTextColor(owes ? 255 : 0, owes ? 0 : 128, 0);
          }
        }
      }
    });
    
    // Expenses Table
    doc.setFontSize(14);
    doc.text('Expense Details', doc.internal.pageSize.getWidth() / 2, doc.lastAutoTable.finalY + 15, { align: 'center' });
    
    const tableData = this.filteredExpenses.map(expense => [
      expense.date,
      expense.category,
      expense.name,
      formatCurrencyForPDF(expense.amount),
      expense.username
    ]);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Date', 'Category', 'Item Name', 'Amount', 'Added By']],
      body: tableData,
      margin: { left: 10, right: 10, bottom: 20, top: 20 },
      tableWidth: 'wrap',
      horizontalAlign: 'center',
      styles: {
        cellPadding: 4,
        fontSize: 9,
        halign: 'left',
        overflow: 'linebreak',
        halign: 'center',  // center all cells
        valign: 'middle',
        lineColor: [85, 124, 86]
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
        4: { cellWidth: 40 }
      },
      headStyles: {
        fillColor: 	[159, 82, 85],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      }
    });

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    doc.save('expense-report.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    this.$notify({
      title: 'Error',
      message: 'Failed to generate PDF report',
      type: 'error'
    });
  }
}
  }  
};
</script>

<style scoped>
.contribution-section {
  width: 100%;
  max-width: 1140px;
  margin: 5px auto 25px auto;
  height: 250px;
  padding: 10px;
  box-sizing: border-box;
  overflow-y: auto;
  background: linear-gradient(145deg, #f9fbfa, #e8f0ed);
  border: none;
  border-radius: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.293);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contribution-section:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
}

.contribution-section h3 {
  margin: 10px 0 14px;
  font-size: 1.3rem;
  font-weight: 600;
  color: #244b3c;
  text-align: center;
}

.member-contributions-table {
  width: 100%;
  overflow-x: auto;
  margin-top: 10px;
}

.member-contributions-table table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 4px;
}

.member-contributions-table th {
  background-color: #dff0ea;
  font-weight: 700;
  font-size: 0.95rem;
  color: #2e4d3b;
  text-align: center;
  padding: 10px 12px;
  border-bottom: 2px solid #bfded6;
  border-radius: 8px;
}

/* Data cells */
.member-contributions-table td {
  background: #ffffff;
  color: #374151;
  text-align: center;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

/* Zebra striping */
.member-contributions-table tr:nth-child(odd) td {
  background: #f3f7f6;
}

/* Hover row */
.member-contributions-table tr:hover td {
  background: #e4f3ef;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
}

.status-badge.completed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.text-danger {
  color: #dc2626 !important;
  font-weight: 600;
  font-size: 1rem !important;
}

.text-success {
  color: #16a34a !important;
  font-weight: 600;
}

.member-filter {
  position: relative;
  display: inline-block;
  margin-left: 10px;
}

.member-filter select {
  position: relative;
  padding: 8px;
  margin: 3px;
  border-radius: 6px;
  background-color: #ffffff;
  border: 2px solid #336333;
  transition: all 0.3s ease;
  font-size: 15px;
  cursor: pointer;
  min-width: 150px;
  color: #000;
}

.member-filter select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #aaa;
  border-color: #ddd;
}


.small-spinner {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translateY(-50%) rotate(0deg); }
  100% { transform: translateY(-50%) rotate(360deg); }
}
.exceeded-warning {
  margin-top: 0px !important;
  background-color: #e53935;
  border-left: 6px solid #b71c1c;
  border-right: 6px solid #b71c1c;
  padding: 14px 20px;
  margin: 20px auto; /* vertically space + center horizontally */
  margin-inline: 30px; 
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #ffffff;
  font-size: 20px;
  text-align: center;
  width: 100%; 
  box-sizing: border-box;
}
.current-group {
  margin: 20px auto;
  padding: 8px 16px;
  width: 95%;
  max-width: 400px;
  background-color: #e0f7f4;
  border-left: 4px solid #2ca58d;
  border-right: 4px solid #2ca58d;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.group-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 4px 0;
}

.current-group h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #256d5c;
  font-weight: 600;
}

.current-group p {
  margin: 0;
  font-size: 1rem;
  color: #4b6f6b;
}

.current-group i {
  color: #2ca58d;
  font-size: 1rem;
}

.show-groups-button {
  display: block;
  width: 95%;
  min-width: 250px;
  margin: 20px 20px;
  padding: 12px 36px;
  background: linear-gradient(135deg, #e8ffec, #def4f3, #c4fff1);
  color: #32615f;
  border: 2px solid #385248;
  font-size: 1.25rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
  letter-spacing: 0.5px;
  background-size: 200% 200%; /* For smoother animated transition */
  background-position: left;
}

.show-groups-button:hover {
  background-position: right;
  background: linear-gradient(135deg, #67c29a, #359588);
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.25);
}


.show-groups-button i {
  margin-right: 12px; 
  transition: transform 0.3s ease; 
}

.show-groups-button:hover i {
  transform: rotate(15deg); 
}

/* Modal Styles */
.group-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.group-modal {
  background: #ffffff;
  border-radius: 16px;
  width: 85%;
  max-width: 460px;
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s ease-out;
  scrollbar-width: thin;
  scrollbar-color: #6a9c89 transparent;
}

/* Webkit scrollbar */
.group-modal::-webkit-scrollbar {
  width: 6px;
}
.group-modal::-webkit-scrollbar-thumb {
  background-color: #6a9c89;
  border-radius: 8px;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.group-modal-header {
  background: linear-gradient(135deg, #67c29a, #359588);
  color: white;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.group-modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.4rem;
  color: white;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: background-color 0.3s, transform 0.2s;
}
.close-modal:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.groups-list {
  padding: 14px;
  background-color: #f7fdf9;
}

.group-item {
  background: #ffffff;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.25s, box-shadow 0.25s;
  cursor: pointer;
}
.group-item:hover {
  background-color: #e4f4ef;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.group-info h4 {
  margin: 0;
  font-size: 1.05rem;
  color: #4f7a6b;
}

.group-meta {
  margin-top: 4px;
  font-size: 0.85rem;
  color: #6a9c89;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.group-meta i {
  margin-right: 6px;
  color: #6a9c89;
}

.group-actions {
  color: #4f7a6b;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  transition: transform 0.3s;
}
.group-item:hover .group-actions {
  transform: translateX(4px);
}

.no-expenses-message {
  justify-content: center;
  align-items: center;
  padding: 20px;
  text-align: center;
  font-style: italic;
  font-size: 22px;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 10px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.no-expenses-message {
  justify-content: center;   
  align-items: center;                 
  padding: 20px;
  text-align: center;
  font-style: italic;
  font-size: 23px;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 10px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.no-expenses-message {
  animation: fadeIn 0.5s ease-in-out;
}


.text-danger {
  color: #ffffff;
  font-weight: bold;
  font-size: 25px;
}

.exceeded-warning {
  margin-top: 0px !important;
  background-color: #e53935;
  border-left: 6px solid #b71c1c;
  border-right: 6px solid #b71c1c;
  padding: 14px 20px;
  margin: 20px auto;
  margin-inline: 30px; 
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #ffffff;
  font-size: 20px;
  text-align: center;
  width: 100%; 
  box-sizing: border-box;
}


.summary-box {
  padding: 2px 16px 6px 16px; 
  background-color: #dbfff7;
  border: none;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.293);
  font-size: 16px;
  margin: 2px 0 6px 0; 
  text-align: center;
  color: #000000;
  min-width: 250px;
  max-width: 100%;
  margin-bottom: 15px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  font-size: 16px; 
  font-weight: bold;
}

.summary-item.remaining {
  padding-top: 5px;
  border-top: 1px solid #eee;
  margin-top: 8px;
}

.progress-bar {
  width: 100%;
  height: 9px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 7px;
}
.progress {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
}

.progress-bar .progress.exceeded {
  background: #bb2318 !important;
}

.progress-bar .progress {
  background: linear-gradient(135deg, #7aa98c, #5e8873, #486858);
}

.percentage {
  text-align: right;
  font-size: 13px; 
  margin-top: 4px;
  color: #555;
  font-weight: bold;
}

.negative {
  color: #e74c3c;
  font-weight: 500;
}

.con {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 10px;
}

.nav-con {
font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
font-size: 20px;
position: relative;
margin-top: 100px;
display: flex;
justify-content: center;
margin-bottom: -10px;
width: 100%;
}


button {
  border-radius: 8px;
  padding: 12px 20px;
  position: relative;
  font-size: 20px;
  border: 2px solid #386233;
  background-color: #fffef5;
  cursor: pointer;
  transition: 0.3s ease;
}

button.active {
  background: linear-gradient(135deg, #67c29a, #359588);
  text-shadow: 2px 1px 4px rgba(0, 0, 0, 0.2);
  color: white;
  border-color: #32615f;
}

button:hover {
  background-color: #32615f;
  color: white;
}

.budget-section {
  text-align: center;
  margin-top: 20px;
  min-height: 654px;
}

.budget-section h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.budget-section p {
  font-size: 24px;
  color: red;
}

.con-container {
  background: #fafffe;
  padding: 10px;
  border: none;
  border-radius: 20px;
  width: 80%; 
  min-width: 280px;
  max-width: 680px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.293);
  align-items: flex-start;
  margin-bottom: 10px;
  max-height: 130vh; 
}

/* For Chrome/Edge/Safari */
.con-container::-webkit-scrollbar {
  width: 8px;
}

.con-container::-webkit-scrollbar-track {
  background: #ecfcec;
  border-radius: 0 20px 20px 0;
}

.con-container::-webkit-scrollbar-thumb {
  background-color: #2a4935;
  border-radius: 20px;
}

.filter-buttons button {
  position: relative;
  padding: 8px;
  margin: 3px;
  border-radius: 1px;
  background-color: #ffffff;
  border: 2px solid #336333;
  transition: all 0.3s ease;
  font-size: 15px;
  border-radius: 6px;
}

.filter-buttons button.active {
    background: linear-gradient(135deg, #67c29a, #359588);
    text-shadow: 2px 1px 4px rgba(0, 0, 0, 0.2);
    color: white;
    border-color: #32615f;
}

.filter-buttons button:hover {
  background-color: #32615f;
}

.expense-table {
  max-height: 500px;
  overflow-y: auto;
  scrollbar-width: thin; 
  scrollbar-color: #32615f #ecfcf9;
}

.expense-table table {
  position: relative;
  width: 95%;
  justify-self: center;
  margin-top: 20px;
  border-collapse: collapse;
  table-layout: fixed;
}

.expense-table th, .expense-table td {
  padding: 12px;
  text-align: center;
  border: 1px solid #000000;
  vertical-align: top;
  word-break: break-word; 
}

.expense-table td { 
 font-size: 15px;
}

.expense-table th {
  background: linear-gradient(135deg, #6fcfa5, #3ea799);
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.277);
  color: white;
}

.expense-table tr {
  background-color: white;
}

.expense-table tr.alternate-row {
  background-color: #eefffc;
}

.total-amount {
  margin-top: 20px;
  font-weight: bold;
}

.chart-summary {
  max-height: 700px;
  margin-left: 25px;
}

.chart{
  width: 400px;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(to right, #f4fffa, #f0fff9, #e6fff6);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.293);
  max-height: 700px;
  border: none;
  margin-bottom: 25px;
}

.download {
  display: flex;
  flex-wrap: wrap;
  justify-content: center; 
  align-items: center; 
  margin-top: 10px;
  gap: 10px;
}

.download select {
  width: 100px; 
  padding: 6px 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff;
  cursor: pointer;
}

.download-button {
  display: flex;
  flex-wrap: wrap;
  padding: 10px 20px;
  font-size: 16px;
  background: linear-gradient(135deg, #67c29a, #359588);
  color: white;
  border: none;
  cursor: pointer;
  align-self: center;
  margin: 10px 0 8px 3px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.download-button:hover {
  background: linear-gradient(135deg, #359588, #2a7267);
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
}


@media (max-width: 1135px) {
.con-container {
    max-height: 130vh;
    margin-bottom: 10px;
  }
.show-groups-button {
   margin-left: 0px;
   width: 100%;
}
.chart-summary {
  margin-left: 0;
}
.chart{
    width: 400px;
  }
  .current-group {
    width: 80%;
  }
  .contribution-section {
    width: 90%;
  }
  .expense-table th, .expense-table td {
    font-size: 13px;
    padding: 8px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 37px;
  }
  .nav-con{
    text-align: center;
  }
  .con-container {
    max-height: 140vh;
    margin-bottom: 10px;
  }
  .chart-summary{
    width: 85%;
    margin-left: 0;
  }
  .chart{
    width: 100%;
  }
  .expense-table th, .expense-table td {
    font-size: 11px;
    padding: 7px 1px;
  }
  .show-groups-button {
   margin-left: 20px;
  }
  button, p {
    font-size: 15px;
    margin: 15px;
  }
  .filter-buttons button {
    font-size: 14px;
  }
}
</style>