import axios from 'axios';

function getDefaultState() {
  return {
    currentGroup: {
      group_name: '',
      group_code: '',
      created_at: null,
      created_by: null
    },
    members: [],
    expenses: [],
    groupBudget: null,
    loading: false,
    error: null,
    isAdmin: false
  };
}

export default {
    namespaced: true,
    state: getDefaultState(),
    mutations: {
      RESET_EXPENSES(state) {
        state.expenses = [];
      },
      SET_CURRENT_GROUP_ID(state, groupId) {
        state.currentGroupId = groupId;
      },
      SET_GROUP_BUDGET(state, budget) {
        state.groupBudget = budget || null;
      },
      RESET_STATE(state) {
        Object.assign(state, getDefaultState());
      },
      SET_GROUP(state, group) {
        state.currentGroup = group;
      },
      SET_MEMBERS(state, members) {
        state.members = members;
      },
      SET_EXPENSES(state, expenses) {
        state.expenses = Array.isArray(expenses) ? expenses : [];
      },
      SET_LOADING(state, loading) {
        state.loading = loading;
      },
      SET_ERROR(state, error) {
        state.error = error;
      },
      SET_ADMIN(state, isAdmin) {
        state.isAdmin = isAdmin;
      },
      PROMOTE_MEMBER(state, { memberId, updatedData }) {
        const index = state.members.findIndex(m => m.id === memberId);
        if (index !== -1) {
          // Update the member with the new data
          state.members[index] = {
            ...state.members[index],
            ...updatedData
          };
        }
      },
      ADD_EXPENSE(state, expense) {
        console.log('Current expenses:', state.expenses);
        console.log('Type of expenses:', typeof state.expenses);
        if (!Array.isArray(state.expenses)) {
          console.warn('Expenses was not an array, resetting it');
          state.expenses = [];
        }
        state.expenses.push(expense);
      },
      UPDATE_EXPENSE(state, updatedExpense) {
        const index = state.expenses.findIndex(e => e.id === updatedExpense.id);
        if (index !== -1) {
          state.expenses.splice(index, 1, updatedExpense);
        }
      },
      REMOVE_EXPENSE(state, expenseId) {
        state.expenses = state.expenses.filter(e => e.id !== expenseId);
      },
      ADD_MEMBER(state, member) {
        state.members.push(member);
      },
      REMOVE_MEMBER(state, memberId) {
        state.members = state.members.filter(m => m.id !== memberId);
      }
    },
    actions: {

async sendInvite({ commit }, { groupId, email }) {
  try {
    const response = await axios.post(
      `/api/grp_expenses/groups/${groupId}/invite`, // Fixed endpoint
      { email },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
      
          if (response.data.success) {
            return response.data;
          } else {
            throw new Error(response.data.message || 'Failed to send invitation');
          }
        } catch (error) {
          console.error('Error sending invite:', error);
          throw error;
        }
      },

      async createGroup({ commit }, groupData) {
        try {
          const response = await axios.post('/api/grp_expenses/create', groupData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
            }
          });
          
          if (!response.data.success) {
            throw new Error(response.data.message || 'Group creation failed');
          }
          
          return response.data.data; // Return the created group data
        } catch (err) {
          console.error('Group creation error:', err);
          throw err;
        }
      },

      async fetchGroup({ commit }, groupId) {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        try {
          const [groupRes, membersRes] = await Promise.all([
            axios.get(`/api/grp_expenses/${groupId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('jsontoken')}` }
            }),
            axios.get(`/api/grp_expenses/${groupId}/members`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('jsontoken')}` }
            })
          ]);
      
          commit('SET_GROUP', groupRes.data.data);
          const members = membersRes.data.data.map(member => ({
            id: member.id,
            username: member.username,
            email: member.email,
            role: member.role
          }));
          commit('SET_MEMBERS', members);
      
          // Enhanced admin check
          const user = JSON.parse(localStorage.getItem('user'));
          const currentMember = membersRes.data.data.find(m => m.id === user?.id);
          const isAdmin = currentMember?.role === 'admin';
          
          console.log('Setting admin status:', isAdmin); // Add logging
          commit('SET_ADMIN', isAdmin);
          
          return groupRes.data.data;
        } catch (err) {
    if (err.code === 'ECONNABORTED') {
      commit('SET_ERROR', 'Request timeout. Please try again.');
    } else {
      commit('SET_ERROR', err.response?.data?.message || err.message);
    }
    throw err;
  } finally {
    commit('SET_LOADING', false);
  }
},
      
async fetchGroupBudget({ commit }, groupId) {
  try {
    const res = await axios.get(
      `/api/grp_expenses/groups/${groupId}/budget`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('jsontoken')}` }
  });
    
  commit('SET_GROUP_BUDGET', res.data.data || null);
  return res.data.data;
} catch (err) {
  if (err.response?.status === 404) {
    // No budget exists yet - set to null
    commit('SET_GROUP_BUDGET', null);
    return null;
  }
  console.error('Failed to fetch budget:', err);
  throw err;
}
},


    
async addGroupBudget({ commit }, { groupId, budgetAmount, budgetName }) {
  try {
    const res = await axios.post(
      `/api/grp_expenses/groups/${groupId}/budget`,
      { 
        budget_amount: budgetAmount,
        budget_name: budgetName 
      },
      { 
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}` 
        }
      }
    );
    
    commit('SET_GROUP_BUDGET', res.data.data);
    return res.data;
  } catch (err) {
    console.error('Failed to add budget:', {
      error: err,
      response: err.response?.data
    });
    throw err;
  }
},

async updateGroupBudget({ commit }, { groupId, budgetAmount, budgetName }) {
  try {
    const res = await axios.put(
      `/api/grp_expenses/groups/${groupId}/budget`,
      { 
        budget_amount: budgetAmount, 
        budget_name: budgetName || 'Group Budget'
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
    
    commit('SET_GROUP_BUDGET', res.data.data);
    return res.data;
  } catch (err) {
    console.error('Update budget error:', err);
    throw err;
  }
},

async fetchExpenses({ commit }, { groupId, monthYear }) {
  commit('SET_LOADING', true);
  commit('SET_ERROR', null);
  
  try {
    const res = await axios.get(`/api/grp_expenses/${groupId}/expenses`, {
      params: { monthYear },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
      }
    });

    const expensesData = res.data.success ? (res.data.data || []) : [];
    commit('SET_EXPENSES', expensesData);

    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to fetch expenses');
    }
  } catch (err) {
    commit('SET_ERROR', err.response?.data?.message || 'Failed to load expenses');
    throw err;
  } finally {
    commit('SET_LOADING', false);
  }
},
      
      async addExpense({ commit }, expenseData) {
        try {
          const res = await axios.post(
            `/api/grp_expenses/${expenseData.group_id}/expenses`,
            expenseData,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
              }
            }
          );
          
          if (!res.data.success) {
            throw new Error(res.data.message || 'Failed to add expense');
          }

          console.log('Expense added:', res.data.data);
          
          commit('ADD_EXPENSE', res.data.data);
          return res.data;
        } catch (err) {
          console.error('Add expense error:', {
            error: err,
            response: err.response?.data
          });
          throw err;
        }
      },
      
      async updateExpense({ commit }, expenseData) {
        try {
          const res = await axios.put(
            `/api/grp_expenses/${expenseData.group_id}/expenses/${expenseData.id}`,
            expenseData,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
              }
            }
          );

          if (!res.data.success) {
            throw new Error(res.data.message || 'Failed to update expense');
          }
          
          commit('UPDATE_EXPENSE', res.data.data);
          return res.data;
        } catch (err) {
          console.error('Update expense error:', err);
          throw err;
        }
      },
      
      async deleteExpense({ commit }, { expenseId, groupId }) {
          try {
    const response = await axios.delete(
      `/api/grp_expenses/${groupId}/expenses/${expenseId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete expense');
    }
    
    commit('REMOVE_EXPENSE', expenseId);
    return response.data;
  } catch (err) {
    console.error('Delete expense error:', err);
    throw err;
  }
},
      
async sendInvite({ commit }, { groupId, email }) {
  try {
    const url = `/api/grp_expenses/groups/${groupId}/members/invite`;
    console.log('Sending invite to:', url); // Add this line
    
    const response = await axios.post(
      url,
      { email },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to send invitation');
    }
  } catch (error) {
    console.error('Error sending invite:', error);
    throw error;
  }
},
      
      async removeMember({ commit }, { groupId, memberId, reason }) {
        try {
          const response = await axios.delete(
            `/api/grp_expenses/groups/${groupId}/members/${memberId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
              },
              data: { reason }
            }
          );

          if (response.data.success) {
            commit('REMOVE_MEMBER', memberId);
            return response.data;
          } else {
            throw new Error(response.data.message || 'Failed to remove member');
          }
        } catch (error) {
          console.error('Error removing member:', error);
          throw error;
        }
      },
      
      async updateGroupName({ commit, state }, { groupId, name }) {
        try {
          const res = await axios.put(
            `/api/grp_expenses/update-group/${groupId}`,
            { name },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
              }
            }
          );
          
          if (res.data.success) {
            commit('SET_GROUP', { 
              ...state.currentGroup, 
              group_name: name 
            });
            return true;
          }
          throw new Error(res.data.message || 'Update failed');
        } catch (err) {
          console.error('Update group name error:', err);
          throw err;
        }
      },
      
      async promoteToAdmin({ commit }, { groupId, memberId }) {
        try {
          const response = await axios.put(
            `/api/grp_expenses/groups/${groupId}/members/${memberId}/promote`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
              }
            }
          );
      
          if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to promote member');
          }
      
          // Commit both the promotion and the updated member data
          commit('PROMOTE_MEMBER', {
            memberId: memberId,
            updatedData: { role: 'admin' }
          });
          
          return response.data;
        } catch (err) {
          console.error('Promote member error:', err);
          throw err;
        }
      },

      async leaveGroup({ commit }, groupId) {
        try {
          const response = await axios.delete(
            `/api/grp_expenses/groups/${groupId}/leave`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
              }
            }
          );
      
          if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to leave group');
          }
      
          return response.data;
        } catch (err) {
          console.error('Leave group error:', err);
          throw err;
        }
      },

      async deleteGroup({ commit }, groupId) {
        try {
          const response = await axios.delete(
            `/api/grp_expenses/delete-group/${groupId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
              }
            }
          );
      
          if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to delete group');
          }
      
          commit('RESET_STATE');
          return true;
        } catch (err) {
          console.error('Delete group error:', {
            error: err,
            response: err.response?.data
          });
          throw err;
        }
      }
    },
    getters: {
      getViewExpenses(state) {
        if (!state.currentGroupId) return [];
        return state.expenses.filter(expense => expense.group_id === state.currentGroupId);
      },

      creatorName: (state) => {
        if (!state.currentGroup?.created_by) return '';
        const creator = state.members.find(m => m.id === state.currentGroup.created_by);
        return creator ? creator.username : '';
      },
      currentMonthExpenses: (state) => state.expenses
    }
  };