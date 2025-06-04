
<template>
  <Navigation />
  <div class="group-header-decoration">

  <div class="group-container">

    <!-- Add this container for the group list -->
    <div v-if="showGroupList" class="group-modal-overlay">
      <div class="group-modal">
        <div class="group-modal-header">
        <h3>Your Groups</h3>
        <button @click="toggleGroupList" class="close-modal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="groups-list">
        <div 
          v-for="group in userGroups" 
          :key="group.id" 
          class="group-item"
          @click="navigateToGroup(group.id)"
          :class="{ active: group.id === $route.params.groupId }"
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
    
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading group data...</p>
    </div>

    <div v-else-if="expensesError" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchGroupData" class="retry-button">Retry</button>
    </div>

    <div v-else class="group-content">
    <div class="group-header">
      <div class="header-top-row">
        <div class="group-title-section">
          <h1 class="group-name">{{ group.group_name || 'Loading...' }}</h1>
          <div class="group-code-badge" v-if="group.group_code">
            <span>Code: {{ group.group_code }}</span>
            <button @click="copyGroupCode" class="copy-button">
              <i class="far fa-copy"></i>
            </button>
          </div>
        </div>
        <div class="group-action-buttons">
          <button @click="toggleGroupList" class="my-groups-btn">
            <i class="fas fa-users"></i> My Groups
          </button>
          <button @click="goToGroupManagement" class="manage-groups-btn">
            <i class="fas fa-users-cog"></i> New Group
          </button>
        </div>
      </div>

      <div class="group-meta-info">
        <div class="meta-item">
          <i class="fas fa-user"></i>
          <span>Created by: {{ creatorName || 'Loading...' }}</span>
        </div>
        <div class="meta-item" v-if="group.created_at">
          <i class="fas fa-calendar"></i>
          <span>Created: {{ formatDate(group.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
  
  <div class="group-con">
    <div class="budget-total-container">
    <div class="budget-container">
      <div v-if="budgetSuccessMessage" class="budget-success-message" :class="{ hide: budgetHideMessage }">
        {{ budgetSuccessMessage }}
      </div>

      <div v-if="showBudgetExceededAlert" class="floating-alert">
        <div class="alert-content">
                  <i class="fas fa-exclamation-triangle"></i>
                  <span>{{ budgetExceededMessage }}</span>
                  <button @click="closeAlert" class="close-alert-btn">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div class="budget-display">
              <div class="budget-header">
                <h3>Allotted Budget</h3>
                <button v-if="!hasBudget && isAdmin"  @click="showAddBudgetForm" class="btn-add">Add</button>
                <button v-else-if="hasBudget && isAdmin" @click="showEditBudgetForm" class="btn-edit">Edit</button>
              </div>


              <div v-if="!isBudgetLoading">
                <div v-if="hasBudget" class="budget-details">
                  <div class="budget">
                  <div class="budget-name">
                    <span>Budget Name:</span>
                    <strong>{{ groupBudget?.budget_name || 'General Budget' }}</strong>
                  </div>
                  
    
                  <div class="budget-amount">
                    <span>Budget Amount:</span>
                    <strong>{{ formatPHP(groupBudget?.budget_amount || 0) }}</strong>
                  </div>
                </div>
                  
                <div class="expenses-summary1">
                <div class="total-expenses">
        <span>Total Expenses:</span>
        <strong>{{ formatPHP(totalAmount) }}</strong>
      </div>

                  <div class="remaining-budget">
                    <span>Remaining Budget:</span>
                    <strong :class="{ 'text-danger': remainingBudget < 0 }">
                      {{ formatPHP(remainingBudget) }}
                    </strong>
                  </div>
                  </div>
    
                  <div class="budget-progress">
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        :style="{ width: budgetProgress + '%' }"
                        :class="{ exceeded: budgetProgress >= 100 }"
                      ></div>
                    </div>
                    <div class="progress-text">{{ budgetProgress.toFixed(1) }}% used</div>
                  </div>
                </div>

                <div v-else class="no-budget">
                  <p>No budget set for this group</p>
                </div>
              </div>
              <div v-else>
                <div class="loading-spinner"></div>
              </div>

        <!-- Budget Form Modal -->
        <div v-if="isAddingBudget || isEditingBudget" class="budget-form-modal">
          <div class="budget-form">
              <h2>{{ isEditingBudget ? 'Edit' : 'Add' }} Allotted Budget</h2>

              <div class="form-group">
              <label>Budget Name:</label>
              <input
                type="text"
                v-model="budgetName"
                placeholder="e.g. Birthday Party"
                required
              />
            </div>

            <div class="form-group">
              <label>Amount (₱)</label>
              <input v-model="budgetAmountInput" type="number" min="0" step="0.01" @input="formatCurrencyInput">
            </div>

            <div class="form-actions">
              <button @click="isEditingBudget ? updateBudget() : submitAddBudget()" class="btn-save">
                {{ isEditingBudget ? 'Update' : 'Save' }}
              </button>
              <button @click="cancelBudgetForm" class="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div class="contribution-form">
    <h3><i class="fas fa-edit"></i> Add Your Contribution</h3>
    <div class="form-group">
    <label>Amount (₱)</label>
    <input 
      type="number" 
      v-model.number="paidAmountInput" 
      placeholder="Enter amount"
      min="0"
      step="0.01"
      @keyup.enter="saveContribution"
      :disabled="!canAddContributions"
    >
  </div>

  <div class="btn-save-wrapper">
    <button 
      @click="saveContribution" 
      class="btn-save"
      :disabled="paidAmountLoading || !paidAmountInput || paidAmountInput <= 0 || !canAddContributions"
      :class="{ 'disabled-btn': !canAddContributions }"
    >
      <span v-if="paidAmountLoading">
        <i class="fas fa-spinner fa-spin"></i> Saving...
      </span>
      <span v-else>Save Contribution</span>
  </button>
  </div>

  <div v-if="!canAddContributions" class="contributions-disabled-notice">
    <i class="fas fa-info-circle"></i> Contributions can only be added after expenses are created in this group.
  </div>

  <div v-if="contributionHistory.length > 0" class="contribution-history">
    <h4><i class="fas fa-history"></i> Your Contribution History</h4>
    <ul class="contribution-list">
  <li v-for="(contribution, index) in contributionHistory" :key="index">
    <div class="contribution-date">
      {{ formatDate(contribution.date) }}
    </div>
    <div class="contribution-amount">
      {{ formatPHP(contribution.amount) }}
    </div>
    <button @click="editContribution(contribution)" class="edit-btn" title="Edit">
      <i class="fas fa-edit"></i>
    </button>
  </li>
</ul>
  </div>
      <div v-else class="no-contributions">
      <p>No contribution history found for this group</p>
    </div>
</div>
  </div>
  


<div class="group-wrapper">
  <div class="group-body">
    <div class="group-tabs">
      <button 
        @click="activeTab = 'expenses'" 
        :class="{ active: activeTab === 'expenses' }"
      >
        Expenses
      </button>
      <button @click="activeTab = 'members'" :class="{ active: activeTab === 'members' }">
        Members ({{ members?.length || 0 }})
      </button>
      <button 
        @click="activeTab = 'contribution'" 
        :class="{ active: activeTab === 'contribution' }"
      >
        Contribution
      </button>
      <button 
    @click="activeTab = 'photos'" 
    :class="{ active: activeTab === 'photos' }"
  >
    Photos
  </button>
      <button 
        v-if="isAdmin"
        @click="activeTab = 'settings'" 
        :class="{ active: activeTab === 'settings' }"
      >
        Settings
      </button>
    </div>

    <div class="tab-content">
      <!-- Expenses Tab -->
      <div v-if="activeTab === 'expenses'" class="expenses-tab">
        <div class="expense-controls">
          <button 
  @click="showAddExpenseModal = true" 
  class="add-expense-button"
  :disabled="!hasBudget"
>
  <i class="fas fa-plus"></i> Add <br> Expense
  <span v-if="!hasBudget" class="tooltip">Please set a budget first</span>
</button>
        </div>

        <div v-if="expensesLoading" class="loading-expenses">
          <div class="spinner small"></div>
        </div>

        <div v-else-if="expensesError" class="error-message">
          Error loading expenses: {{ expensesError }}
          <button @click="loadExpenses" class="retry-btn">Retry</button>
        </div>

        <div v-else-if="!expenses">
          <p>Expenses data not loaded</p>
          <button @click="loadExpenses" class="retry-btn">Load Expenses</button>
        </div>
                
        <div v-else-if="!filteredExpenses || filteredExpenses.length === 0" class="no-expenses">
          <p>No expenses recorded for {{ currentMonthYear }}</p>
        </div>
                
        <div v-else class="expenses-container">
          <h3><i class="fas fa-coins"></i> <span>GROUP EXPENSES</span></h3> 
          <div class="expenses-section"> 
            <div class="expenses-table"> 
              <table>
                <thead>
                  <tr>
                    <th>Expense Type</th>
                    <th>Item Name</th>
                    <th>Item Price</th>
                    <th>Date</th>
                    <th>Added By</th>
                    <th>Note</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="expense in filteredExpenses" :key="expense.id">
                    <td>{{ (expense.expense_type || 'N/A') .toUpperCase() }}</td>
                    <td>{{ (expense.item_name || 'N/A') .toUpperCase() }}</td>
                    <td>{{ formatPHP(expense.item_price) }}</td>
                    <td>{{ formatDate(expense.expense_date) }}</td>
                    <td>{{ expense.username }}</td>
                    <td>{{ expense.note || 'no note' }}</td>
                    <td class="actions">
                      <div class="action-buttons">
                        <button 
                          @click="editExpense(expense)" 
                          class="button-edit"
                          :disabled="!canEditExpense(expense)"
                        >
                          Edit
                        </button>
                        <button 
                          @click="confirmDeleteExpense(expense)" 
                          class="button-delete"
                          :disabled="!canEditExpense(expense)"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="total-summary">
                <div class="total-amount-card">
                  <div class="total-label">TOTAL EXPENSES</div>
                  <div class="amount-display">
                    <span class="currency php">{{ formatPHP(totalAmount) }}</span>
                    <span class="currency usd">≈ {{ formatUsd(convertPhpToUsd(totalAmount)) }}</span>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>

      <!-- Members Tab -->
      <div v-if="activeTab === 'members'" class="members-tab">
        <div v-if="promoteSuccess" class="promote-success-message">
          <i class="fas fa-check-circle"></i>
          {{ promoteSuccess }}
          <button @click="promoteSuccess = ''" class="close-message">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="members-list">
          <div v-for="member in members" :key="member.id" class="member-item">
            <div class="member-info">
              <span class="member-name">{{ member.username }}</span>
              <span class="member-email">{{ member.email }}</span>
            </div>
            <div class="member-role">
              <span :class="['role-badge', member.role]">
                {{ member.role }}
                <i v-if="member.role === 'admin'" class="fas fa-crown"></i>
              </span>
              <div class="member-actions" v-if="isAdmin && member.role !== 'admin'">
                <button @click="promoteToAdmin(member)" class="promote-button">
                  Promote to Admin
                </button>
                <button @click="confirmRemoveMember(member)" class="remove-button">
                  Remove
                </button>
                <button @click="confirmBlockMember(member)" class="block-button">
                Block
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="isAdmin" class="blocked-members-section">
    <button @click="toggleBlockedMembers" class="btn-blocked-members">
      <i class="fas fa-ban"></i> 
      {{ showBlockedMembers ? 'Hide' : 'Show' }} Blocked Members
      ({{ blockedMembers.length }})
    </button>
    
    <div v-if="showBlockedMembers" class="blocked-members-list">
      <div v-if="blockedMembers.length === 0" class="no-blocked-members">
        <p>No blocked members</p>
      </div>
      
      <div v-else>
        <div v-for="member in blockedMembers" :key="member.id" class="blocked-member-item">
          <div class="member-info">
            <span class="member-name">{{ member.username }}</span>
            <span class="member-email">{{ member.email }}</span>
            <div class="blocked-info">
              <span>Blocked by: {{ member.blocked_by }}</span>
              <span>On: {{ formatDate(member.blocked_at) }}</span>
            </div>
          </div>
          <div class="member-actions">
            <button 
              @click="confirmUnblockMember(member)" 
              class="unblock-button"
              :disabled="unblockingMember"
            >
              <span v-if="unblockingMember">
                <i class="fas fa-spinner fa-spin"></i> Unblocking...
              </span>
              <span v-else>Unblock</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

        <div class="invite-section">
            <h3>Invite New Member</h3>
            <div class="invite-form">
              <input 
                v-model="inviteEmail" 
                type="email" 
                placeholder="Enter email address"
                class="email-input"
              >
              <button @click="sendInvite" class="invite-button">
                Send Invite
              </button>
            </div>
            <p v-if="inviteError" class="error-message">{{ inviteError }}</p>
            <p v-if="inviteSuccess" class="success-message">{{ inviteSuccess }}</p>
          </div>

        <div v-if="!isAdmin" class="leave-group-section">
          <h4><i class="fas fa-sign-out-alt"></i> Leave Group</h4>
          <button @click="leaveGroup" class="leave-group-button">
            Leave This Group
          </button>
          <p class="leave-group-warning">
            Warning: This action cannot be undone. You'll need to be invited again to rejoin.
          </p>
        </div>
        
        <div v-else class="admin-leave-notice">
          <h4><i class="fas fa-info-circle"></i> Admin Notice</h4>
          <p>
            As an admin, you cannot leave this group. 
          </p>
        </div>
        </div>

      <!-- Contribution Tab -->
      <div v-if="activeTab === 'contribution'" class="contribution-tab">
        <div class="contribution-header">
          <h2><i class="fas fa-hand-holding-usd"></i> Group Contributions</h2>
          <p>Track and manage contributions and balances for this group</p>
        </div>

        <div class="contribution-summary">
          <div class="summary-card">
            <div class="summary-label">Total Expenses</div>
            <div class="summary-amount">{{ formatPHP(totalAmount) }}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Contributed</div>
            <div class="summary-amount">{{ formatPHP(totalContributions) }}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Your Share</div>
            <div class="summary-amount">{{ formatPHP(yourShare) }}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Your Balance</div>
            <div class="summary-amount" :class="{ 'text-danger': yourBalance < 0, 'text-success': yourBalance >= 0 }">
              {{ formatPHP(Math.abs(yourBalance)) }}
              <span v-if="yourBalance < 0">(You owe)</span>
              <span v-else>(You're owed)</span>
            </div>
          </div>
        </div>

        <div class="contribution-section">
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
      </div>

      <div v-if="activeTab === 'photos'" class="photos-tab">
        <div class="photos-header">
  <div class="photos-title">
    <h2><i class="fas fa-images"></i> Group Photos</h2>
    <p><i class="fas fa-arrow-down"></i> Upload your receipt or proof of expense</p>
  </div>
  <button @click="showUploadModal = true" class="upload-photo-btn">
    <i class="fas fa-plus"></i> Upload Photo
  </button>
</div>

  <div v-if="photosLoading" class="loading-container">
    <div class="spinner"></div>
    <p>Loading photos...</p>
  </div>

  <div v-else-if="photosError" class="error-container">
    <p class="error-message">{{ photosError }}</p>
    <button @click="fetchPhotos" class="retry-button">Retry</button>
  </div>

  <div v-else-if="groupPhotos.length === 0" class="no-photos">
    <p>No photos uploaded yet. Be the first to share!</p>
  </div>

  <div v-else class="photos-grid">
    <div v-for="photo in groupPhotos" :key="photo.id" class="photo-card">
      <div class="photo-wrapper">
        <img :src="photo.image_url" :alt="photo.description || 'Group photo'" @click="openPhotoModal(photo)" class="photo-thumbnail" @error="handleImageError">
        <div class="photo-actions" v-if="canEditPhoto(photo) || canDeletePhoto(photo)">
  <button 
    v-if="canEditPhoto(photo)" 
    @click.stop="editPhoto(photo)" 
    class="edit-photo-btn"
  >
    <i class="fas fa-edit"></i>
  </button>
  <button 
    v-if="canDeletePhoto(photo)" 
    @click.stop="confirmDeletePhoto(photo)" 
    class="delete-photo-btn"
  >
    <i class="fas fa-trash"></i>
  </button>
        </div>
      </div>
      <div class="photo-meta">
        <p class="photo-description">{{ photo.description || 'No description' }}</p>
        <div class="photo-footer">
          <span class="photo-uploader">
            <i class="fas fa-user"></i> {{ photo.username }}
          </span>
          <span class="photo-date">
            <i class="far fa-calendar-alt"></i> {{ formatDate(photo.created_at) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

      <!-- Settings Tab (Admin Only) -->
      <div v-if="activeTab === 'settings' && isAdmin" class="settings-tab">
        <div class="settings-section">
    <h3 class="section-title"><i class="fas fa-user-clock"></i> Pending Join Requests</h3>
    
    <div v-if="pendingRequestsLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading pending requests...</p>
    </div>
    
    <div v-else-if="pendingRequestsError" class="error-container">
      <p class="error-message">{{ pendingRequestsError }}</p>
      <button @click="fetchPendingRequests" class="retry-button">Retry</button>
    </div>
    
    <div v-else-if="pendingRequests.length === 0" class="no-requests">
      <p>No pending join requests</p>
    </div>
    
    <div v-else class="requests-list">
      <div v-for="request in pendingRequests" :key="request.id" class="request-item">
        <div class="request-info">
          <span class="request-user">{{ request.username }}</span>
          <span class="request-email">{{ request.email }}</span>
          <span class="request-date">Requested: {{ formatDate(request.requested_at) }}</span>
        </div>
        
        <div class="request-actions">
          <button @click="approveRequest(request)" class="approve-button">
            <i class="fas fa-check"></i> Approve
          </button>
          <button @click="rejectRequest(request)" class="reject-button">
            <i class="fas fa-times"></i> Reject
          </button>
        </div>
      </div>
    </div>
  </div>
        
        <div class="settings-section">
          <h3 class="section-title"><i class="fas fa-cog"></i> Group Settings</h3>
         
          <div class="setting-item">
            <label class="setting-label">Group Name</label>
            <div class="input-group">
              <input 
                v-model="group.group_name" 
                @blur="handleNameUpdate"
                @keyup.enter="handleNameUpdate"
                type="text" 
                class="setting-input"
                :disabled="updatingName"
              >
              <button 
                @click="handleNameUpdate" 
                class="save-button"
                :disabled="!nameChanged || updatingName"
              >
                <span v-if="updatingName">Saving...</span>
                <span v-else>Save</span>
              </button>
            </div>
            <p v-if="nameError" class="error-message">{{ nameError }}</p>
          </div>
        </div>
        
        <div class="danger-zone">
          <h3 class="danger-title"><i class="fas fa-exclamation-triangle"></i> Danger Zone</h3>
          <div class="danger-item">
            <p class="danger-text">Delete this group permanently (including all expenses and members)</p>
            <button 
              @click="confirmDeleteGroup" 
              class="delete-button"
              :disabled="deletingGroup"
            >
              <span v-if="deletingGroup">
                <i class="fas fa-spinner fa-spin"></i> Deleting...
              </span>
              <span v-else>Delete Group</span>
            </button>
            <p v-if="deleteGroupError" class="error-message">{{ deleteGroupError }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Photo Modal -->
  <div v-if="editingPhoto" class="modal-overlay5">
  <div class="modal-content5 photo-edit-modal">
    <div class="modal-header6">
      <h3>Edit Photo Details</h3>
      <button @click="editingPhoto = null" class="close-button">&times;</button>
    </div>
    <div class="modal-body5">
      <form @submit.prevent="updatePhoto">
        <div class="form-group5">
          <label>Photo Description</label>
          <textarea v-model="editingPhoto.description" placeholder="Update description"></textarea>
        </div>
        
        <div class="form-group5">
          <label>Replace Photo (Optional)</label>
          <input 
            type="file" 
            ref="editPhotoInput"
            accept="image/*"
            @change="handleEditFileSelect"
          >
          <div v-if="editPhotoPreview" class="photo-preview1">
            <img :src="editPhotoPreview" alt="Preview">
          </div>
          <div v-else class="current-photo">
            <p>Current Photo:</p>
            <img :src="editingPhoto.image_url" :alt="editingPhoto.description" class="photo-thumbnail">
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="editingPhoto = null" class="cancel-button">Cancel</button>
          <button type="submit" class="submit-button" :disabled="updatingPhoto">
            <span v-if="updatingPhoto">
              <i class="fas fa-spinner fa-spin"></i> Updating...
            </span>
            <span v-else>Update Photo</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

  <!-- Photo Upload Modal -->
<div v-if="showUploadModal" class="modal-overlay5">
  <div class="modal-content5 photo-upload-modal">
    <div class="modal-header5">
      <h3>Upload Photo</h3>
      <button @click="closePhotoModal" class="close-button">&times;</button>
    </div>
    <div class="modal-body5">
      <form @submit.prevent="uploadPhoto">
        <div class="form-group5">
          <label>Photo Description</label>
          <textarea v-model="newPhoto.description" placeholder="Add a description (optional)"></textarea>
        </div>
        
        <div class="form-group5">
          <label>Select Photo</label>
          <input 
            type="file" 
            ref="photoInput"
            accept="image/*"
            @change="handleFileSelect"
            required
          >
          <div v-if="photoPreview" class="photo-preview">
            <img :src="photoPreview" alt="Preview">
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="closePhotoModal" class="cancel-button">Cancel</button>
          <button type="submit" class="submit-button" :disabled="uploadingPhoto">
            <span v-if="uploadingPhoto">
              <i class="fas fa-spinner fa-spin"></i> Uploading...
            </span>
            <span v-else>Upload Photo</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Photo View Modal -->
<div v-if="viewingPhoto" class="modal-overlay5 photo-view-modal">
  <div class="modal-content5">
    <div class="modal-header5">
      <h3>Photo Details</h3>
      <button @click="viewingPhoto = null; resetZoom()" class="close-button">&times;</button>
    </div>
    <div class="modal-body5">
      <div class="image-container" @wheel.prevent="handleWheelZoom">
        <img 
          :src="viewingPhoto.image_url" 
          :alt="viewingPhoto.description"
          :style="zoomStyle"
          ref="zoomImage"
          @mousedown="startDrag"
        >
      </div>
      <div class="zoom-controls">
        <button @click="zoomIn" class="zoom-btn" title="Zoom In">
          <i class="fas fa-search-plus"></i>
        </button>
        <button @click="zoomOut" class="zoom-btn" title="Zoom Out">
          <i class="fas fa-search-minus"></i>
        </button>
        <button @click="resetZoom" class="zoom-btn" title="Reset Zoom">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
      <div class="photo-details">
        <p v-if="viewingPhoto.description" class="photo-description">{{ viewingPhoto.description }}</p>
        <p class="photo-meta">Uploaded on {{ formatDate(viewingPhoto.created_at) }}</p>
      </div>
    </div>
  </div>
</div>
    <!-- Add Expense Modal -->
    <div v-if="showAddExpenseModal" class="modal-overlay">
  <div class="modal-content2">
    <div class="modal-header">
      <h3>Add New Expense</h3>
      <button @click="closeModal" class="close-button">&times;</button>
    </div>
    <div class="modal-body">
      <button 
        @click="showVoiceHelp()" 
        class="voice-help-btn" 
        title="Voice commands help"
      >
        <i class="fas fa-question-circle"></i> Voice Help
      </button>

      <form @submit.prevent="submitExpense">
        <div class="form-group">
          <label>Category</label>
          <div class="input-with-voice">
            <select 
              v-model="newExpense.expense_type" 
              required 
              @change="handleCategoryChange"
            >
              <option value="">Select a category</option>
              <option value="Food">FOOD</option>
              <option value="Bill">BILL</option>
              <option value="Transportation">TRANSPORTATION</option>
              <option value="Entertainment">ENTERTAINMENT</option>
              <option value="Healthcare">HEALTHCARE</option>
              <option value="Shopping">SHOPPING</option>
              <option value="Other">OTHER</option>
            </select>
            <button 
      @click="startVoiceInput('category')" 
      class="voice-btn" 
      :class="{ active: isListening && voiceInputActiveField === 'category' }"
      title="Set category by voice"
    >
      <i class="fas fa-microphone"></i>
    </button>
          </div>
        </div>

        <!-- Custom Category Field with Voice Input -->
        <div v-if="newExpense.expense_type === 'Other'" class="form-group">
          <label>Custom Category</label>
          <div class="input-with-voice">
            <input 
              v-model="customExpenseType" 
              type="text" 
              placeholder="Enter custom category name"
              required
            />
            <button 
              @click="startVoiceInput('customType')" 
              class="voice-btn"
              :class="{ active: isListening && voiceInputActiveField === 'customType' }"
              title="Set custom category by voice"
            >
              <i class="fas fa-microphone"></i>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Item Name</label>
          <div class="input-with-voice">
            <input 
              v-model="newExpense.item_name" 
              @input="newExpense.item_name = $event.target.value.toUpperCase()"
              type="text" 
              required
              minlength="2"
              maxlength="255"
            />
            <button 
      @click="startVoiceInput('item')" 
      class="voice-btn" 
      :class="{ active: isListening && voiceInputActiveField === 'item' }"
      title="Set item name by voice"
    >
      <i class="fas fa-microphone"></i>
    </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>Amount</label>
          <div class="input-with-voice">
            <input 
              v-model="newExpense.item_price" 
              type="number" 
              step="0.01" 
              min="0" 
              required
            />
            <button 
      @click="startVoiceInput('amount')" 
      class="voice-btn" 
      :class="{ active: isListening && voiceInputActiveField === 'amount' }"
      title="Set amount by voice"
    >
      <i class="fas fa-microphone"></i>
    </button>
          </div>
        </div>

        <div class="form-group">
          <label>Note</label>
          <div class="input-with-voice">
            <input 
              v-model="newExpense.note" 
              placeholder="Enter a note (optional)"
              type="text" 
              minlength="2"
              maxlength="255"
            />
            <button 
              @click="startVoiceInput('note')" 
              class="voice-btn" 
              :class="{ active: isListening && voiceInputActiveField === 'note' }"
              title="Set note by voice"
            >
              <i class="fas fa-microphone"></i>
            </button>
          </div>
        </div>

        
        <div class="form-actions">
          <button type="button" @click="closeModal" class="cancel-button">Cancel</button>
          <button type="submit" class="submit-button">Add Expense</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Voice Help Modal -->
<div v-if="showVoiceHelpModal" class="voice-help-modal">
  <div class="voice-help-content">
    <div class="voice-help-header">
      <h3><i class="fas fa-microphone"></i> Voice Commands Help</h3>
    </div>
    <div class="voice-help-body">
      <div class="voice-command" v-for="(command, index) in voiceCommandsHelp" :key="index">
        <div class="command-prefix">•</div>
        <div class="command-details">
          <span class="command-example">{{ command.example }}</span>
          <span class="command-description">- {{ command.description }}</span>
        </div>
      </div>
    </div>
    <div class="voice-help-footer">
      <button @click="showVoiceHelpModal = false" class="btn-ok">Got it!</button>
    </div>
  </div>
</div>

      <!-- Edit Contribution Modal -->
      <div v-if="showEditContributionModal" class="modal-overlay">
  <div class="con-contribution">
    <h3>Edit Contribution</h3>
    
    <div class="form-group">
      <label>Amount (₱)</label>
      <input 
        type="number" 
        v-model.number="editingContribution.amount" 
        placeholder="Enter amount"
        min="0"
        step="0.01"
        class="form-control"
        @keyup.enter="updateContribution"
      >
    </div>

    <div class="modal-actions">
      <button @click="updateContribution" class="btn-save1" :disabled="!editingContribution.amount || editingContribution.amount <= 0">
        Save Changes
      </button>
      <button @click="cancelEditContribution" class="btn-cancel">
        Cancel
      </button>
    </div>
  </div>
</div>

    <!-- Edit Expense Modal -->
    <div v-if="showEditExpenseModal" class="modal-overlay">
      <div class="modal-content1">
        <div class="modal-header">
          <h3>Edit Expense</h3>
          <button @click="closeModal" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleUpdateExpense">
            <div class="form-group">
              <label>Category</label>
              <select v-model="editingExpense.expense_type" required>
              <option value="Food">FOOD</option>
              <option value="Bill">BILL</option>
              <option value="Transportation">TRANSPORTATION</option>
              <option value="Entertainment">ENTERTAINMENT</option>
              <option value="Healthcare">HEALTHCARE</option>
              <option value="Shopping">SHOPPING</option>
              <option value="Other">OTHER</option>
              </select>
            </div>
            <div v-if="editingExpense.expense_type === 'Other'" class="form-group">
          <label>Custom Category</label>
          <input 
            v-model="customExpenseType" 
            type="text" 
            placeholder="Enter custom category name"
            required
          >
        </div>
            <div class="form-group">
              <label>Item Name</label>
              <input v-model="editingExpense.item_name" @input="editingExpense.item_name = $event.target.value.toUpperCase()" type="text" required>
            </div>
            <div class="form-group">
              <label>Amount</label>
              <input v-model="editingExpense.item_price" type="number" step="0.01" min="0" required>
            </div>
            <div class="form-group">
              <label>Note</label>
              <input v-model="editingExpense.note" type="text">
            </div>
            <div class="form-actions">
              <button type="button" @click="closeModal" class="cancel-button">Cancel</button>
              <button type="submit" class="submit-button">Update Expense</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div v-if="showConfirmationModal" class="modal-overlay">
      <div class="modal-content confirmation-modal">
        <div class="modal-header2">
          <h3>{{ confirmationTitle }}</h3>
          <button @click="closeModal" class="close-button">&times;</button>
        </div>
        <div class="modal-body2">
          <p>{{ confirmationMessage }}</p>

          <!-- Conditional note input -->
          <div v-if="confirmationNoteRequired" class="note-section">
            <label for="noteInput">Reason:</label>
            <textarea
              id="noteInput"
              v-model="confirmationNote"
              placeholder="Enter your reason here (optional)"
              rows="1"
              class="note-textarea"
            ></textarea>
          </div>

          <div class="confirmation-actions">
            <button @click="closeModal" class="cancel-button">Cancel</button>
            <button @click="confirmAction" class="confirm-button">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
  </div>
</template>

<script>
import Navigation from "./navigation.vue";
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
  name: 'Group',
  components: { Navigation },
  props: {
    groupId: {
      type: [String, Number],
      required: false,
      default: null
    }
  },
  data() {
    return {
      confirmationNote: '', 
      confirmationNoteRequired: false,
      pendingRequests: [],
      pendingRequestsLoading: false,
      pendingRequestsError: null,
      blockedMembers: [],
      blockingMember: false,
      unblockingMember: false,
      showBlockedMembers: false,
      editPhotoPreview: null,
      editPhotoFile: null,
      editingPhoto: null,  // Initialize as null
      updatingPhoto: false,
      zoomLevel: 1,
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      translate: { x: 0, y: 0 },
      lastPosition: { x: 0, y: 0 },
      pendingInvites: [],
      memberContributions: [],
      contributions: [],
      paidAmountInput: 0,
      contributionNoteInput: '',
      contributionHistory: [],
      paidAmountLoading: false,
      localGroupId: this.groupId,
      showGroupList: false,
      userGroups: [],
      activeTab: 'expenses',
      currentMonthYear: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      expensesError: null,
      expensesLoading: false,
      updatingName: false,
      nameError: '',
      originalName: '',
      deletingGroup: false,
      deleteGroupError: '',
      exchangeRate: null,
      lastExchangeRateUpdate: null,
      remainingBudget: 0,
      budgetProgress: 0,
      budgetName: '',
      selectedBudgetId: null,
      isBudgetLoading: false,
      isAddingBudget: false,
      isEditingBudget: false,
      budgetAmountInput: '',
      budgetSuccessMessage: '',
      budgetHideMessage: false,
      showBudgetExceededAlert: false,
      budgetExceededMessage: "Warning: You have exceeded the allotted budget!",
      showAddExpenseModal: false,
      showEditExpenseModal: false,
      showConfirmationModal: false,
      promoteSuccess: '',
      showEditContributionModal: false,
      photoPreview: null,
      uploadingPhoto: false,
      groupPhotos: [],
      photosLoading: false,
      photosError: null,
      showUploadModal: false,
      viewingPhoto: null,
      newPhoto: {
      description: '',
      file: null
    },
      editingContribution: {
      id: null,
      amount: 0,
      date: '',
      status: '',
      originalAmount: 0
    },
      
      // Form data
      newExpense: {
        item_name: '',
        item_price: 0,
        expense_type: '',
        note: '',
      },
      customExpenseType: '', 
      editingExpense: {
      expense_type: '',
      item_name: '',
      item_price: null,
      note: ''
    },
      
      editingExpense: {},
      confirmationTitle: '',
      confirmationMessage: '',
      confirmAction: () => {},
      
      // Invite member
      inviteEmail: '',
      inviteError: '',
      inviteSuccess: '',
      isListening: false,
      showVoiceHelpModal: false,
      isListening: false,
      voiceInput: '',
      voiceCommands: [],
      recognition: null,
      voiceInputActiveField: null,
      voiceCommandsHelp: [
      {
        example: "Click the voice recorder button before speaking, and click it again when you're done."
      },
      {
        example: "Say the category (e.g., 'Transportation')."
  },
      {
        example: "If you selected 'Other', say your custom category (e.g., 'Pet supplies')."
      },
      {
        example: "Say the item name (e.g., 'Jeepney')." 
      },
      {
        example: "Say the item price (e.g., 'eleven pesos')."
      }
    ]
    };
  },
  computed: {
    ...mapState('group', { // Use object syntax for clarity
      currentGroup: state => state.currentGroup,
      members: state => state.members,
      expenses: state => state.expenses,
      loading: state => state.loading,
      error: state => state.error,
      isAdmin: state => state.isAdmin,
      groupBudget: state => state.groupBudget || {}
    }),

    canAddContributions() {
    return this.filteredExpenses.length > 0;
  },

    zoomStyle() {
    return {
      transform: `scale(${this.zoomLevel}) translate(${this.translate.x}px, ${this.translate.y}px)`,
      cursor: this.zoomLevel > 1 ? 'grab' : 'default'
    };
  },

    totalContributions() {
    if (!this.contributions) return 0;
    return this.contributions.reduce((total, contribution) => {
      return total + parseFloat(contribution.amount || 0);
    }, 0);
  },
  
  yourShare() {
    return this.totalAmount / (this.members?.length || 1);
  },
  
  yourBalance() {
    const user = JSON.parse(localStorage.getItem('user'));
    const yourContribution = this.memberContributions?.find(m => m.id === user?.id)?.contributed || 0;
    return yourContribution - this.yourShare;
  },
  
    hasBudget() {
  return this.groupBudget && this.groupBudget.budget_amount !== undefined && this.groupBudget.budget_amount !== null;
},

  formattedBudgetAmount() {
    return this.formatPHP(this.budgetAmountValue);
  },

  budgetAmountValue() {
    return this.groupBudget ? parseFloat(this.groupBudget.budget_amount) : 0;
  },

  
    totalExpenses() {
    return this.totalAmount; // Use totalAmount to dynamically reflect the total of all expenses
  },

    ...mapGetters('group', ['creatorName']),

    nameChanged() {
    return this.group.group_name !== this.originalName;
  },

    group() {
      return this.currentGroup || {};
    },

    filteredExpenses() {
    if (!this.expenses || !Array.isArray(this.expenses)) return [];
    return this.expenses.filter(expense => {
      if (!expense.expense_date) return false;
      
      const expenseDate = new Date(expense.expense_date);
      const currentDate = new Date(this.currentMonthYear);
      
      return (
        expenseDate.getFullYear() === currentDate.getFullYear() &&
        expenseDate.getMonth() === currentDate.getMonth()
      );
    });
  },

  totalAmount() {
  return this.filteredExpenses.reduce((total, expense) => {
    return total + (parseFloat(expense.item_price) || 0); 
  }, 0);
},

  convertPhpToUsd() {
  return (phpAmount) => {
    const rate = this.exchangeRate || 0.018045;
    const usd = parseFloat(phpAmount) * rate;
    return parseFloat((phpAmount * rate).toFixed(6));
  };
},

  // Format USD currency
  formatUsd() {
    return (amount) => {
      return `$${parseFloat(amount || 0).toFixed(2)}`;
    };
  },

  hasGroupAccess() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !this.group?.id) return false;
  
  // Check if user is in members list
  const isMember = this.members?.some(m => m.id === user.id);
  
  // Also check pending invites in case the UI hasn't updated yet
  const hasPendingInvite = this.pendingInvites?.some(
    invite => invite.group_id === this.group.id && invite.email === user.email
  );
  
  return isMember || hasPendingInvite;
}
  },

  watch: {
    isAdmin(newVal) {
    if (newVal) {
      this.fetchPendingRequests();
    }
  },
    localGroupId: {
    immediate: true,
    async handler(newGroupId, oldGroupId) {
      if (newGroupId && newGroupId !== oldGroupId) {
        // Reset blocked members state when group changes
        this.blockedMembers = [];
        this.showBlockedMembers = false;
        
        // If admin, fetch fresh data
        if (this.isAdmin) {
          await this.fetchBlockedMembers();
        }
      }
    }
  },
  'groupId': {
    immediate: true,
    async handler(newGroupId, oldGroupId) {
      if (newGroupId && newGroupId !== oldGroupId) {
        // Reset all local data
        this.resetComponentState();
        
        // Update local group ID
        this.localGroupId = newGroupId;
        
        // Fetch all necessary data
        await Promise.all([
          this.fetchGroupData(),
          this.fetchPhotos(),
          this.loadExpenses(),
          this.fetchContributions(),
          this.fetchContributionHistory(),
          this.fetchBudgetData()
        ]);
        
        // Set original name for comparison
        this.originalName = this.group.group_name || '';
      }
    }
  },
  'groupBudget': {
    deep: true,
    handler() {
      this.calculateRemaining();
    }
  },
  'contributions': {
    deep: true,
    handler() {
      this.updateMemberContributions();
    }
  },
  'expenses': {
    deep: true,
    handler() {
      this.updateMemberContributions();
    }
  },
  'filteredExpenses': {
    deep: true,
    handler() {
      this.updateMemberContributions();
    }
  },

  async mounted() {
  await this.fetchGroupData();
  if (this.isAdmin) {
    await this.fetchBlockedMembers();
  }
},

    budgetSuccessMessage(newVal) {
    if (newVal) {
      this.budgetHideMessage = false; // Reset if showing again
      setTimeout(() => {
        this.budgetHideMessage = true; // Trigger fade-out

        // After fade-out completes, remove message from DOM
        setTimeout(() => {
          this.budgetSuccessMessage = null;
        }, 500); // matches .hide opacity transition
      }, 3000); // message stays visible for 3 seconds
    }
  }
  },

  async created() {
  console.log('Group component created');
  
  this.setupVoiceRecognition();
  
  // Handle invitation token first
  const inviteToken = this.$route.query.inviteToken || localStorage.getItem('invitationToken');
  if (inviteToken) {
    try {
      await this.handleInviteAcceptance(inviteToken);
      const response = await this.$axios.get(
        `/api/grp_expenses/invite/accept?token=${inviteToken}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        }
      );
      
      if (response.data.success) {
        // If requires login, redirect to login with token
        if (response.data.requiresAuth) {
          localStorage.setItem('invitationToken', inviteToken);
          this.$router.push({
            path: '/login',
            query: { 
              redirect: `/group/${response.data.data.groupId}`,
              inviteToken: inviteToken 
            }
          });
          return;
        }
        
        // If successful, clear token and proceed
        this.$notify({
          title: 'Success',
          message: `You've joined ${response.data.data.groupName}`,
          type: 'success'
        });
        
        localStorage.removeItem('invitationToken');
        
        // Update the localGroupId if different
        if (this.localGroupId !== response.data.data.groupId) {
          this.localGroupId = response.data.data.groupId;
          this.$router.push(response.data.data.redirectUrl || `/group/${response.data.data.groupId}`);
          return;
        }
      }
    } catch (err) {
      console.error('Failed to process invitation:', err);
      this.$notify({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to accept invitation',
        type: 'error'
      });
    }
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('jsontoken');

  if (!user || !token) {
    this.$router.push('/login');
    return;
  }

  if (!this.localGroupId) {
    console.error('Missing groupId parameter');
    this.$router.push('/GC');
    return;
  }

  try {
    // Verify membership
    const verifyResponse = await this.$axios.get(
      `/api/grp_expenses/${this.localGroupId}/verify-membership`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!verifyResponse.data.isMember) {
      throw new Error('Not a group member');
    }


    if (this.groupId) {
      this.isBudgetLoading = true;
      try {
        const res = await this.$axios.get(
        `/api/grp_expenses/groups/${this.groupId}/budget`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        }
      );
        if (res.data && res.data.amount != null) {
          this.calculateRemaining();
        }
      } catch (error) {
        console.error('Failed to fetch budget:', error);
      } finally {
        this.isBudgetLoading = false;
      }
    }

    console.log('Initializing group data...');
    await this.initializeGroupData();
    console.log('Fetching photos...');
    await this.fetchPhotos();
    console.log('Fetching contributions...');
    await this.fetchContributions();
    console.log('Fetching contribution history...');
    await this.fetchContributionHistory();
    console.log('Fetching budget data...');
    await this.fetchBudgetData();
    console.log('Fetching group data...');
    await this.fetchGroupData();
    console.log('Loading expenses...');
    await this.loadExpenses();
    console.log('Fetching exchange rates...');
    await this.fetchExchangeRate();
    console.log('Fetching user groups...');
    await this.fetchUserGroups();
    console.log('All data loaded successfully');
    
    this.originalName = this.group.group_name || '';


    await this.initializeGroupData();
     await this.fetchUserGroups(),
     await this.fetchContributions();
     await this.fetchContributionHistory();

    this.contributions = this.contributions || [];
    this.memberContributions = this.memberContributions || [];
    
    if (this.isAdmin) {
      await this.fetchPendingRequests();
    }

   // await this.fetchAvailableBudgets();
  } catch (err) {
    console.error('Failed to load group data:', err);
    this.$notify({
      title: 'Error',
      message: 'Failed to load group data',
      type: 'error'
    });

    if (err.message.includes('initialization')) {
      this.$router.push('/GC');
    }
  }
},

  methods: {
    ...mapActions('group', [
      'fetchGroup',
      'fetchExpenses',
      'addExpense',
      'updateExpense',
      'deleteExpense',
      'sendInvite',
      'removeMember',
      'deleteGroup',
      'fetchGroupBudget',
      'addGroupBudget',   
      'updateGroupBudget'
    //  'fetchAvailableBudgets'
    ]),

    resetComponentState() {
    // Reset all component data that's specific to a group
    //this.expenses = [];
    this.$store.commit('group/RESET_EXPENSES');
    this.contributions = [];
    this.contributionHistory = [];
    this.memberContributions = [];
    this.groupPhotos = [];
    this.blockedMembers = [];
    this.pendingRequests = [];
    this.pendingInvites = [];
    this.showBlockedMembers = false;
    
    // Reset budget related data
    this.remainingBudget = 0;
    this.budgetProgress = 0;
    
    // Reset any modal states
    this.showAddExpenseModal = false;
    this.showEditExpenseModal = false;
    this.showConfirmationModal = false;
    
    // Reset form data
    this.resetNewExpense();
  },
  
        setNoteFromVoice(noteText) {
        this.newExpense.note = noteText;
        this.$toast.success(`Note set to: ${noteText}`);
      },

      editPhoto(photo) {
      this.editingPhoto = { ...photo };
    },

canEditPhoto(photo) {
    const user = JSON.parse(localStorage.getItem('user'));
    return photo.user_id === user.id;
  },

    zoomIn() {
    if (this.zoomLevel < 3) {
      this.zoomLevel += 0.1;
    }
  },
  zoomOut() {
    if (this.zoomLevel > 0.5) {
      this.zoomLevel -= 0.1;
    }
  },
  resetZoom() {
    this.zoomLevel = 1;
    this.translate = { x: 0, y: 0 };
    this.lastPosition = { x: 0, y: 0 };
  },
  handleWheelZoom(e) {
    e.preventDefault();
    if (e.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  },
  startDrag(e) {
    if (this.zoomLevel <= 1) return;
    
    this.isDragging = true;
    this.dragStart = {
      x: e.clientX - this.lastPosition.x,
      y: e.clientY - this.lastPosition.y
    };
    document.addEventListener('mousemove', this.dragImage);
    document.addEventListener('mouseup', this.stopDrag);
  },
  dragImage(e) {
    if (!this.isDragging) return;
    
    this.translate = {
      x: e.clientX - this.dragStart.x,
      y: e.clientY - this.dragStart.y
    };
  },
  stopDrag() {
    this.isDragging = false;
    this.lastPosition = {
      x: this.translate.x,
      y: this.translate.y
    };
    document.removeEventListener('mousemove', this.dragImage);
    document.removeEventListener('mouseup', this.stopDrag);
  },

    handleImageError(event) {
  console.error('Image failed to load:', event.target.src);
  // Try to reconstruct the correct URL if it failed
  const incorrectUrl = event.target.src;
  if (incorrectUrl.includes('localhost:5173/uploads')) {
    const correctUrl = incorrectUrl.replace(
      'http://localhost:5173/uploads', 
      `${this.$axios.defaults.baseURL}/uploads`
    );
    event.target.src = correctUrl;
  } else {
    event.target.style.display = 'none';
  }
},

    closeAlert() {
    this.showBudgetExceededAlert = false;
  },
  
    showVoiceHelp() {
    this.showVoiceHelpModal = true;
  },

  setupVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      this.voiceInput = transcript;
      this.processVoiceCommand(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition.start();
      }
    };

    // Define voice commands
    this.voiceCommands = [
      {
        pattern: /^(set|select|choose) category (.*)/i,
        action: (match) => this.setCategoryFromVoice(match[2])
      },
      {
        pattern: /^(add|enter|set) item (.*)/i,
        action: (match) => this.setItemNameFromVoice(match[2])
      },
      {
        pattern: /^(set|enter) amount (.*)/i,
        action: (match) => this.setAmountFromVoice(match[2])
      },
      {
        pattern: /^(set|add|enter) note (.*)/i,
        action: (match) => this.setNoteFromVoice(match[2])
      },
      {
        pattern: /^submit|save|add expense/i,
        action: () => this.handleSubmit()
      },
      {
        pattern: /^help|what can i say/i,
        action: () => this.showVoiceHelp()
      }
    ];
  },

  startVoiceInput(field = null) {
    if (!this.recognition) {
      alert('Voice recognition is not supported in your browser');
      return;
    }

    this.stopVoiceInput();

    this.voiceInputActiveField = field;
    this.isListening = true;
    this.voiceInput = ''; 
    try {
      this.recognition.start();
      this.$toast.info("Listening... Speak now");
    } catch (err) {
      console.error('Speech recognition error:', err);
      this.$toast.error("Error starting voice recognition");
      this.isListening = false;
    }
  },

  stopVoiceInput() {
    if (this.isListening) {
      this.isListening = false;
      this.voiceInputActiveField = null;
      try {
        if (this.recognition) {
          this.recognition.stop();
        }
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
      this.$toast.info("Stopped listening");
    }
  },

  processVoiceCommand(transcript) {
    if (!this.isListening) return;

    // Clean the transcript
    transcript = transcript.trim().toLowerCase();
    this.voiceInput = transcript;

    // Handle field-specific input
    if (this.voiceInputActiveField) {
      switch (this.voiceInputActiveField) {
        case 'category':
          this.handleCategoryInput(transcript);
          break;
        case 'item':
          this.handleItemInput(transcript);
          break;
        case 'amount':
          this.handleAmountInput(transcript);
          break;
        case 'customType': 
          this.handleCustomTypeInput(transcript);
          break;
        case 'note':
          this.handleNoteInput(transcript);
          break;
        }
      this.stopVoiceInput(); // Auto-stop after field input
      return;
    }

 this.handleGeneralCommands(transcript);
  },

  handleCategoryInput(transcript) {
    const category = this.matchCategory(transcript);
    this.newExpense.expense_type = category;
    this.$toast.success(`Category set to: ${category}`);
  },

  handleCustomTypeInput(transcript) {
  this.customExpenseType = transcript;
  this.$toast.success(`Custom type set to: ${transcript}`);
},

  handleItemInput(transcript) {
    this.newExpense.item_name = transcript;
    this.$toast.success(`Item set to: ${transcript}`);
  },

  handleAmountInput(transcript) {
    const amount = this.extractNumber(transcript);
    if (amount !== null) {
      this.newExpense.item_price = amount;
      this.$toast.success(`Amount set to: ${this.formatPHP(amount)}`);
    } else {
      this.$toast.error("Couldn't understand the amount. Please try again.");
    }
  },

    handleNoteInput(transcript) {
    this.newExpense.note = transcript;
    this.$toast.success(`Note set to: ${transcript}`);
  },

  handleGeneralCommands(transcript) {
    if (transcript.startsWith('set category ') || transcript.startsWith('select category ')) {
      const category = transcript.replace(/^(set|select) category /i, '').trim();
      this.handleCategoryInput(category);
      return;
    }

    if (transcript.startsWith('set custom type ') || 
    transcript.startsWith('enter custom type ')) {
  const customType = transcript.replace(/^(set|enter) custom type /i, '').trim();
  this.handleCustomTypeInput(customType);
  return;
}
    
    // Command: Add item
    if (transcript.startsWith('add item ') || transcript.startsWith('set item ')) {
      const item = transcript.replace(/^(add|set) item /i, '').trim();
      this.handleItemInput(item);
      return;
    }
    
    // Command: Set amount
    if (transcript.startsWith('set amount ') || transcript.startsWith('enter amount ')) {
      const amount = transcript.replace(/^(set|enter) amount /i, '').trim();
      this.handleAmountInput(amount);
      return;
    }
    
    // Command: Submit
    if (transcript.includes('submit') || transcript.includes('save')) {
      this.handleSubmit();
      return;
    }
    
    // Command: Stop
    if (transcript.includes('stop') || transcript.includes('cancel')) {
      this.stopVoiceInput();
      return;
    }
    
    // Command: Help
    if (transcript.includes('help')) {
      this.showVoiceHelp();
      return;
    }
    
    // Fallback - if we don't recognize the command
    this.$toast.info("Command not recognized. Say 'help' for available commands.");
  },

  matchCategory(spokenCategory) {
  const categories = ['Food', 'Bill', 'Transportation', 'Entertainment', 'Accomodation', 'Shopping', 'Other'];
  const lowerSpoken = spokenCategory.toLowerCase().trim();
  
  // 1. First check for exact match
  const exactMatch = categories.find(cat => cat.toLowerCase() === lowerSpoken);
  if (exactMatch) return exactMatch;
  
  // 2. Fuzzy matching for each category
  if (['food', 'eat', 'meal', 'restaurant', 'groceries', 'dining', 'lunch', 'dinner', 'breakfast', 'snack'].some(term => lowerSpoken.includes(term))) {
    return 'Food';
  }
  
  if (['bill', 'payment', 'rent', 'electric', 'water', 'internet', 'phone', 'utility', 'subscription', 'mortgage'].some(term => lowerSpoken.includes(term))) {
    return 'Bill';
  }
  
  if (['transport', 'bus', 'train', 'taxi', 'gas', 'fuel', 'parking', 'metro', 'subway', 'uber', 'lyft', 'car', 'maintenance'].some(term => lowerSpoken.includes(term))) {
    return 'Transportation';
  }
  
  if (['entertain', 'movie', 'game', 'concert', 'hobby', 'sport', 'netflix', 'spotify', 'music', 'party', 'bar', 'alcohol'].some(term => lowerSpoken.includes(term))) {
    return 'Entertainment';
  }
  
  if (['hotel', 'dorm', 'rent', 'apartment', 'hostel', 'motel', 'airbnb', 'lodging', 'accommodation', 'lease'].some(term => lowerSpoken.includes(term))) {
  return 'Accommodation';
}
  
  if (['shop', 'clothes', 'gift', 'mall', 'store', 'amazon', 'online', 'purchase', 'buy', 'market'].some(term => lowerSpoken.includes(term))) {
    return 'Shopping';
  }
  
  // 3. Amount detection patterns (optional)
  if (/\d/.test(lowerSpoken)) {
    // If the spoken text contains numbers but no category was matched
    return 'Other';
  }
  
  // 4. Default fallback
  return 'Other';
},

  extractNumber(spokenAmount) {
    // Extract numbers like "twenty five pesos" -> 25
    const wordsToNumbers = {
      'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
      'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
      'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
      'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
      'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'thirty': 30,
      'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
      'eighty': 80, 'ninety': 90
    };

    // Try to extract direct number
    const directNumberMatch = spokenAmount.match(/(\d+(\.\d+)?)/);
    if (directNumberMatch) {
      return parseFloat(directNumberMatch[1]);
    }

    // Try to convert words to number
    const words = spokenAmount.toLowerCase().split(/\s+/);
    let total = 0;
    let current = 0;
    
    for (const word of words) {
      const num = wordsToNumbers[word];
      if (num !== undefined) {
        if (num >= 20) {
          current = num;
        } else {
          current += num;
        }
      } else if (word === 'hundred') {
        current *= 100;
      } else if (word === 'thousand') {
        current *= 1000;
        total += current;
        current = 0;
      }
    }
    
    total += current;
    return total > 0 ? total : null;
  },

  setCategoryFromVoice(category) {
    const matchedCategory = this.matchCategory(category);
    this.customExpenseType = matchedCategory;
    this.$toast.success(`Category set to: ${matchedCategory}`);
  },

  setItemNameFromVoice(itemName) {
    this.newExpense.item_name = itemName;
    this.$toast.success(`Item name set to: ${itemName}`);
  },

  setAmountFromVoice(amount) {
    const numericAmount = this.extractNumber(amount);
    if (numericAmount) {
      this.newExpense.item_price = numericAmount;
      this.$toast.success(`Amount set to: ${this.formatPHP(numericAmount)}`);
    } else {
      this.$toast.error("Couldn't understand the amount");
    }
  },

    formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  },

    showContributionDetails(userId) {
  const userContributions = this.contributions.filter(c => c.user_id === userId);
  const userName = this.members.find(m => m.id === userId)?.username || 'Member';
  
  this.$notify({
    title: `${userName}'s Contributions`,
    message: `
      <div class="contribution-details">
        ${userContributions.map(c => `
          <div class="contribution-item">
            <span class="amount">${this.formatPHP(c.amount)}</span>
            <span class="date">${new Date(c.created_at).toLocaleDateString()}</span>
          </div>
        `).join('')}
        <div class="contribution-total">
          Total: ${this.formatPHP(userContributions.reduce((sum, c) => sum + parseFloat(c.amount), 0))}
        </div>
      </div>
    `,
    duration: 5000,
    dangerouslyUseHTMLString: true
  });
},

handleEditFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    // Validate file type and size
    if (!file.type.match('image.*')) {
      this.showError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      this.showError('Image size should be less than 5MB');
      return;
    }
    
    this.editPhotoFile = file;
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.editPhotoPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
},

handleEditFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    // Validate file type and size
    if (!file.type.match('image.*')) {
      this.showError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      this.showError('Image size should be less than 5MB');
      return;
    }
    
    this.editPhotoFile = file;
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.editPhotoPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
},

async fetchPendingRequests() {
  this.pendingRequestsLoading = true;
  this.pendingRequestsError = null;
  
  try {
    const response = await this.$axios.get(
      `/api/grp_expenses/${this.localGroupId}/requests`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
    
    if (response.data.success) {
      // Transform data to match your template structure
      this.pendingRequests = response.data.data.map(request => ({
        id: request.id,
        username: request.username,
        email: request.email,
        requested_at: request.requested_at
      }));
    }
  } catch (err) {
    this.pendingRequestsError = err.response?.data?.message || 'Failed to load pending requests';
    console.error('Error fetching pending requests:', err);
  } finally {
    this.pendingRequestsLoading = false;
  }
},
  
  async approveRequest(request) {
  try {
    const response = await this.$axios.put(
      `/api/grp_expenses/${this.localGroupId}/requests/${request.id}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
    
    if (response.data.success) {
      this.$notify({
        title: 'Success',
        message: `${request.username} has been approved`,
        type: 'success'
      });
      await this.fetchPendingRequests();
      await this.fetchGroupData(); // Refresh members list
    }
  } catch (err) {
    this.$notify({
      title: 'Error',
      message: err.response?.data?.message || 'Failed to approve request',
      type: 'error'
    });
  }
},
  
async rejectRequest(request) {
  try {
    const response = await this.$axios.put(
      `/api/grp_expenses/${this.localGroupId}/requests/${request.id}/reject`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
    
    if (response.data.success) {
      this.$notify({
        title: 'Success',
        message: `${request.username}'s request has been rejected`,
        type: 'success'
      });
      await this.fetchPendingRequests();
    }
  } catch (err) {
    this.$notify({
      title: 'Error',
      message: err.response?.data?.message || 'Failed to reject request',
      type: 'error'
    });
  }
},

  async joinGroup() {
  try {
    const response = await this.$axios.post(
      '/api/grp_expenses/join',
      { groupCode: this.groupCodeInput },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
    
    if (response.data.success) {
      if (response.data.message.includes('pending')) {
        // Show pending approval message
        this.$notify({
          title: 'Request Submitted',
          message: 'Your join request is pending admin approval',
          type: 'info'
        });
      } else {
        // Regular success message
        this.$notify({
          title: 'Success',
          message: response.data.message,
          type: 'success'
        });
      }
      
      // Refresh groups list
      await this.fetchUserGroups();
    }
  } catch (err) {
    this.$notify({
      title: 'Error',
      message: err.response?.data?.message || 'Failed to join group',
      type: 'error'
    });
  }
},

async updatePhoto() {
  if (!this.editingPhoto) return;
  
  this.updatingPhoto = true;
  
  try {
    const formData = new FormData();
    formData.append('description', this.editingPhoto.description);
    
    // Only append file if it was selected
    if (this.editPhotoFile) {
      formData.append('photo', this.editPhotoFile);
    }
    
    const response = await this.$axios.put(
      `/api/grp_expenses/groups/${this.localGroupId}/photos/${this.editingPhoto.id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
    
    if (response.data.success) {
      // Update the photo in the local array
      const index = this.groupPhotos.findIndex(p => p.id === this.editingPhoto.id);
      if (index !== -1) {
        // If new image was uploaded, update the URL
        if (response.data.photo && response.data.photo.image_url) {
          this.groupPhotos[index].image_url = response.data.photo.image_url.startsWith('/uploads') 
            ? `${this.$axios.defaults.baseURL}${response.data.photo.image_url}`
            : response.data.photo.image_url;
        }
        this.groupPhotos[index].description = this.editingPhoto.description;
      }
      
      this.showSuccess('Photo updated successfully!');
      this.editingPhoto = null;
      this.editPhotoPreview = null;
      this.editPhotoFile = null;
      if (this.$refs.editPhotoInput) {
        this.$refs.editPhotoInput.value = '';
      }
    }
  } catch (err) {
    console.error('Error updating photo:', err);
    this.showError(err.response?.data?.message || 'Failed to update photo');
  } finally {
    this.updatingPhoto = false;
  }
},

async fetchPhotos() {
    this.photosLoading = true;
    this.photosError = null;
    try {
      const response = await this.$axios.get(
        `/api/grp_expenses/groups/${this.localGroupId}/photos`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        }
      );
      
      if (response.data.success) {
      this.groupPhotos = response.data.photos.map(photo => {
        return {
          ...photo,
          image_url: photo.image_url.startsWith('/uploads')
            ? `${this.$axios.defaults.baseURL}${photo.image_url}`
            : photo.image_url,
          // Ensure these fields exist
          username: photo.username || 'Unknown',
          created_at: photo.created_at || new Date().toISOString()
        };
      });
      }
    } catch (err) {
      this.photosError = err.response?.data?.message || 'Failed to load photos';
      console.error('Error fetching photos:', err);
    } finally {
      this.photosLoading = false;
    }
  },
  
  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.match('image.*')) {
      this.showError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.showError('Image size should be less than 5MB');
        return;
      }
      
      this.newPhoto.file = file;
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  },
  
  async uploadPhoto() {
  if (!this.newPhoto.file) {
    this.showError('Please select a photo to upload');
    return;
  }
  
  this.uploadingPhoto = true;
  
  try {
    const formData = new FormData();
    formData.append('photo', this.newPhoto.file);
    formData.append('description', this.newPhoto.description);
    
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await this.$axios.post(
      `/api/grp_expenses/groups/${this.localGroupId}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
    
    if (response.data.success) {
      const photo = {
        ...response.data.photo,
        user_id: user.id, 
        username: user.username, // Make sure username is included
        created_at: new Date().toISOString(), // Ensure date is included
        image_url: response.data.photo.image_url.startsWith('/uploads') 
          ? `${this.$axios.defaults.baseURL}${response.data.photo.image_url}`
          : response.data.photo.image_url
      };

      this.groupPhotos.unshift(photo);
      this.$forceUpdate();
      this.showSuccess('Photo uploaded successfully!');
      this.closePhotoModal();
    } else {
      this.showError(response.data.message || 'Upload failed');
    }
  } catch (err) {
    console.error('Error uploading photo:', err);
    let errorMsg = 'Failed to upload photo';
    if (err.response) {
      errorMsg = err.response.data.message || errorMsg;
      console.error('Server response:', err.response.data);
    }
    this.showError(errorMsg);
  } finally {
    this.uploadingPhoto = false;
  }
},
  
  openPhotoModal(photo) {
    this.viewingPhoto = photo;
  },
  
  closePhotoModal() {
    this.showUploadModal = false;
    this.newPhoto = { description: '', file: null };
    this.photoPreview = null;
    if (this.$refs.photoInput) {
      this.$refs.photoInput.value = '';
    }
  },
  
  confirmDeletePhoto(photo) {
    if (!this.canDeletePhoto(photo)) {
    this.showError('Only the photo uploader can delete this photo');
    return;
  }

    this.confirmationTitle = 'Delete Photo';
    this.confirmationMessage = 'Are you sure you want to delete this photo?';
    this.confirmationNoteRequired = false;
    this.confirmationNote = '';
    this.confirmAction = async () => {
    try {
      await this.deletePhoto(photo.id);
      this.showSuccess('Photo deleted successfully!');
    } catch (err) {
      this.showError(err.response?.data?.message || 'Failed to delete photo');
    } finally {
      this.showConfirmationModal = false; // Always close the modal
    }
  };
  this.showConfirmationModal = true;
},
  
  async deletePhoto(photoId) {
    try {
      await this.$axios.delete(
        `/api/grp_expenses/groups/${this.localGroupId}/photos/${photoId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        }
      );
      
      this.groupPhotos = this.groupPhotos.filter(p => p.id !== photoId);
    } catch (err) {
      console.error('Error deleting photo:', err);
      throw err;
    }
  },
  
  async fetchBlockedMembers() {
    try {
      const response = await this.$axios.get(
        `/api/grp_expenses/groups/${this.localGroupId}/blocked-members`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        }
      );
      
      if (response.data.success) {
        this.blockedMembers = response.data.blockedMembers.map(member => ({
          ...member,
          blocked_at: member.blocked_at || new Date().toISOString()
        }));
      }
    } catch (err) {
      console.error('Failed to fetch blocked members:', err);
      this.showError(err.response?.data?.message || 'Failed to load blocked members');
    }
  },
  
  confirmBlockMember(member) {
    this.confirmationTitle = 'Block Member';
    this.confirmationMessage = `Are you sure you want to block ${member.username}? They won't be able to rejoin unless unblocked.`;
    this.confirmationNoteRequired = true;
    this.confirmationNote = '';
    this.confirmAction = async () => {
      try {
        this.blockingMember = true;
        
        const response = await this.$axios.post(
        `/api/grp_expenses/groups/${this.localGroupId}/members/${member.id}/block`,
        { 
          reason: this.confirmationNote || null 
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        }
      );
        
        if (response.data.success) {
          this.showSuccess(`${member.username} has been blocked`);
          await Promise.all([
            this.fetchGroupData(),
            this.fetchBlockedMembers()
          ]);
        } else {
          this.showError(response.data.message || 'Failed to block member');
        }
      } catch (err) {
        console.error('Failed to block member:', err);
        const errorMsg = err.response?.data?.message || 
                        err.response?.data?.error || 
                        'Failed to block member';
        this.showError(errorMsg);
      } finally {
        this.blockingMember = false;
        this.showConfirmationModal = false;
      }
    };
    this.showConfirmationModal = true;
  },
  
  confirmUnblockMember(member) {
    this.confirmationTitle = 'Unblock Member';
    this.confirmationMessage = `Are you sure you want to unblock ${member.username}? They will be able to rejoin the group.`;
    this.confirmationNoteRequired = false;
    this.confirmationNote = '';
    this.confirmAction = async () => {
      try {
        this.unblockingMember = true;
        
        const response = await this.$axios.post(
          `/api/grp_expenses/groups/${this.localGroupId}/members/${member.id}/unblock`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
            }
          }
        );
        
        if (response.data.success) {
          this.showSuccess(`${member.username} has been unblocked`);
          await this.fetchBlockedMembers();
        } else {
          this.showError(response.data.message || 'Failed to unblock member');
        }
      } catch (err) {
        console.error('Failed to unblock member:', err);
        this.showError(err.response?.data?.message || 'Failed to unblock member');
      } finally {
        this.unblockingMember = false;
        this.showConfirmationModal = false;
      }
    };
    this.showConfirmationModal = true;
  },
  
  toggleBlockedMembers() {
    this.showBlockedMembers = !this.showBlockedMembers;
    if (this.showBlockedMembers && this.blockedMembers.length === 0) {
      this.fetchBlockedMembers();
    }
  },

  canDeletePhoto(photo) {
    const user = JSON.parse(localStorage.getItem('user'));
    return photo.user_id === user.id;
  },

  async handleInviteAcceptance() {
  const inviteToken = this.$route.query.inviteToken || localStorage.getItem('invitationToken');
  if (!inviteToken) return;
  
  try {
    const response = await this.$axios.get(
      `/api/grp_expenses/invite/accept?token=${inviteToken}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
    
    if (response.data.success) {
      if (response.data.requiresAuth) {
        // Store token and redirect to login
        localStorage.setItem('invitationToken', inviteToken);
        this.$router.push({
          path: '/login',
          query: { 
            redirect: `/group/${response.data.data.groupId}`,
            inviteToken: inviteToken 
          }
        });
        return;
      }
      
      // Clear token and proceed if no auth required
      localStorage.removeItem('invitationToken');
      
      // Update the localGroupId if different
      if (this.localGroupId !== response.data.data.groupId) {
        this.localGroupId = response.data.data.groupId;
        this.$router.push(response.data.data.redirectUrl || `/group/${response.data.data.groupId}`);
        return;
      }
      
      // Refresh group data
      await this.fetchGroupData();
    }
  } catch (err) {
    console.error('Failed to process invitation:', err);
    this.$notify({
      title: 'Error',
      message: err.response?.data?.message || 'Failed to accept invitation',
      type: 'error'
    });
  }
},

async verifyMembership() {
  try {
    const response = await this.$axios.get(
      `/api/grp_expenses/${this.localGroupId}/verify-membership`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
    
    if (response.data.success && !response.data.isMember) {
      this.$notify({
        title: 'Access Denied',
        message: 'You are not a member of this group',
        type: 'error'
      });
      this.$router.push('/GC');
    }
  } catch (error) {
    console.error('Failed to verify membership:', error);
    this.$router.push('/GC');
  }
},

async checkPendingInvites() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await this.$axios.get(
        '/api/grp_expenses/pending-invites',
        {
          params: { email: user.email },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        }
      );
      
      if (response.data.success && response.data.data.length > 0) {
        await this.acceptInvite(response.data.data[0]);
      }
    } catch (err) {
      console.error('Failed to check pending invites:', err);
    }
  },
  
async fetchPendingInvites() {
  try {
    const response = await this.$axios.get(
      '/api/grp_expenses/pending-invites',
      {
        params: { email: this.user.email },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
    
    if (response.data.success) {
      this.pendingInvites = response.data.data;
    }
  } catch (err) {
    console.error('Failed to fetch pending invites:', err);
  }
},

showInvites() {
  this.fetchPendingInvites();
},

async acceptInvite(invite) {
    try {
      const response = await this.$axios.get(
        `/api/grp_expenses/invite/accept?token=${invite.token}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        }
      );
      
      if (response.data.success) {
      this.$notify({
        title: 'Success',
        message: `You've joined ${response.data.data.groupName}`,
        type: 'success'
      });
        
        // Refresh the invites list
        await this.fetchGroupData();
      
      // Navigate to group if not already there
      if (this.localGroupId !== response.data.data.groupId) {
        this.$router.push(`/group/${response.data.data.groupId}`);
      } else {
        // If already on the group page, refresh the data
        await Promise.all([
          this.fetchContributions(),
          this.fetchContributionHistory(),
          this.fetchPhotos()
        ]);
      }
    }
  } catch (err) {
    console.error('Failed to accept invitation:', err);
    this.$notify({
      title: 'Error',
      message: err.response?.data?.message || 'Failed to accept invitation',
      type: 'error'
    });
  }
},

async updateMemberContributions() {
  if (!this.members || !this.contributions) {
    this.memberContributions = [];
    return;
  }
  
  const totalExpenses = this.totalAmount;
  const sharePerMember = totalExpenses / (this.members.length || 1);
  
  this.memberContributions = this.members.map(member => {
    const userContributions = this.contributions.filter(c => c.user_id === member.id);
    const contributed = userContributions.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
    const balance = contributed - sharePerMember;
    const newStatus = balance >= 0 ? 'completed' : 'pending';

    // Update backend if status changed
    userContributions.forEach(async (contribution) => {
      if (contribution.status !== newStatus) {
        try {
          await this.$axios.put(
            `/api/grp_expenses/groups/${this.localGroupId}/contributions/${contribution.id}/status`,
            { status: newStatus },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
              }
            }
          );
        } catch (error) {
          console.error('Failed to update contribution status:', error);
        }
      }
    });

    return {
      id: member.id,
      username: member.username,
      contributed,
      share: sharePerMember,
      balance,
      status: newStatus
    };
  });
},

    leaveGroup() {
  this.confirmationTitle = 'Leave Group';
  this.confirmationMessage = 'Are you sure you want to leave this group? You will need to be invited again to rejoin.';
  this.confirmationNoteRequired = false;
  this.confirmationNote = '';
  this.confirmAction = async () => {
    try {
      await this.$store.dispatch('group/leaveGroup', this.localGroupId);
      
      // Show success message
      this.showSuccess('You have left the group successfully');
      
      // Redirect to group list after leaving
      setTimeout(() => {
        this.$router.push('/GC');
      }, 1500);
    } catch (err) {
      console.error('Failed to leave group:', err);
      this.showError(err.response?.data?.message || 'Failed to leave group');
    } finally {
      this.showConfirmationModal = false;
    }
  };
  this.showConfirmationModal = true;
},

    promoteToAdmin(member) {
  this.confirmationTitle = 'Promote to Admin';
  this.confirmationMessage = `Are you sure you want to promote ${member.username} to admin? They will have full control over this group.`;
  this.confirmationNoteRequired = false;
  this.confirmationNote = '';
  this.confirmAction = async () => {
    try {
      await this.$store.dispatch('group/promoteToAdmin', {
        groupId: this.localGroupId,
        memberId: member.id
      });

      this.promoteSuccess = `${member.username} is now an admin!`;

      setTimeout(() => {
        this.promoteSuccess = '';
      }, 5000);
      
      await this.fetchGroupData();
      
    } catch (err) {
      console.error('Failed to promote member:', err);
      this.showError(err.response?.data?.message || 'Failed to promote member');
    } finally {
      this.showConfirmationModal = false;
    }
  };
  this.showConfirmationModal = true;
},

showError(message) {
    this.$notify({
      title: 'Error',
      message: message,
      type: 'error',
      duration: 5000
    });
  },

  showSuccess(message) {
    if (this._isMounted) { // Check if component is still mounted
      this.budgetSuccessMessage = message;
      setTimeout(() => {
        if (this._isMounted) {
          this.budgetSuccessMessage = null;
        }
      }, 3000);
    }
  },

  editExpense(expense) {
    this.editingExpense = { ...expense };
    
    // Check if this is a custom category (not in our standard list)
    const standardCategories = ['Food', 'Bill', 'Transportation', 'Entertainment', 'Accomodation', 'Shopping'];
    if (!standardCategories.includes(expense.expense_type)) {
      this.editingExpense.expense_type = 'Other';
      this.customExpenseType = expense.expense_type;
    } else {
      this.customExpenseType = '';
    }
    
    this.showEditExpenseModal = true;
  },

  handleEditCategoryChange() {
    if (this.editingExpense.expense_type !== 'Other') {
      this.customExpenseType = '';
    }
  },

  formatPHP(amount) {
    return `₱${parseFloat(amount || 0).toFixed(2)}`;
  },

 showEditBudgetForm() {
  if (!this.isAdmin) {
    this.showError('Only group admins can edit budgets');
    return;
  }
  this.isEditingBudget = true;
  this.budgetAmountInput = this.groupBudget.budget_amount.toString();
  this.budgetName = this.groupBudget.budget_name || '';
},

  cancelBudgetForm() {
    this.isAddingBudget = false;
    this.isEditingBudget = false;
  },

  async editContribution(contribution) {
    const plainContribution = JSON.parse(JSON.stringify(contribution));
  console.log('Editing contribution:', plainContribution);

  if (!plainContribution.id) {
    this.showError('Contribution ID is missing');
    return;
  }
  
  this.editingContribution = {
    id: plainContribution.id,
    amount: parseFloat(plainContribution.amount),
    date: plainContribution.date,
    status: plainContribution.status,
    originalAmount: parseFloat(plainContribution.amount),
  };
  this.showEditContributionModal = true;
},

async updateContribution() {
  if (!this.editingContribution?.id) {
    this.showError('Invalid contribution ID');
    return;
  }

  try {
    const response = await this.$axios.put(
      `/api/grp_expenses/groups/${this.localGroupId}/contributions/${this.editingContribution.id}`,
      { amount: this.editingContribution.amount},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
    
    if (response.data.success) {
      this.showSuccess('Contribution updated successfully!');
      await Promise.all([
        this.fetchContributionHistory(),
        this.fetchContributions()
      ]);
      this.showEditContributionModal = false;
    }
  } catch (error) {
    console.error('Failed to update contribution:', error);
    this.showError(error.response?.data?.message || 'Failed to update contribution');
  }
},
  
  cancelEditContribution() {
    if (this.editingContribution.originalAmount) {
      this.editingContribution.amount = this.editingContribution.originalAmount;
    }
    this.showEditContributionModal = false;
  },

  async fetchContributionHistory() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await this.$axios.get(
        `/api/grp_expenses/groups/${this.localGroupId}/contribution-history`,
        {
          params: { user_id: user.id },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        }
      );
      
      if (response.data.success) {
        this.contributionHistory = response.data.history || [];
      console.log('Fetched contribution history:', this.contributionHistory);
      }
    } catch (error) {
      console.error('Failed to fetch contribution history:', error);
    }
  },

  async fetchContributions() {
    try {
      const response = await this.$axios.get(
        `/api/grp_expenses/groups/${this.localGroupId}/contributions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        }
      );
      
      if (response.data.success) {
        this.contributions = response.data.contributions || [];
      console.log('Fetched contributions:', this.contributions);
        this.updateMemberContributions();
      }
    } catch (error) {
      console.error('Failed to fetch contributions:', error);
      this.showError('Failed to load contributions');
    }
  },

  async saveContribution() {
    if (this.paidAmountLoading) return;
    
    try {
      this.paidAmountLoading = true;
      const amount = parseFloat(this.paidAmountInput);
      
      if (isNaN(amount) || amount <= 0) {
        this.showError('Please enter a valid amount');
        return;
      }

      if (this.filteredExpenses.length === 0) {
      this.showError('Cannot add contributions - the group has no expenses yet');
      return;
    }
      
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await this.$axios.post(
        `/api/grp_expenses/groups/${this.localGroupId}/contributions`,
        { 
          amount,
          user_id: user.id,
          group_id: this.localGroupId 
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        }
      );
      
      if (response.data.success) {
        this.showSuccess('Contribution saved successfully!');
        this.paidAmountInput = 0;
        this.contributionNoteInput = ''; 

        await Promise.all([
          this.fetchContributions(),
          this.fetchContributionHistory(),
          this.fetchGroupData()
        ]);

      this.$forceUpdate();
    }
    } catch (error) {
      console.error('Failed to save contribution:', error);
      this.showError(error.response?.data?.message || 'Failed to save contribution');
    } finally {
      this.paidAmountLoading = false;
    }
  },
  
  async showAddBudgetForm() {
    try {
    await this.fetchGroupData();
    console.log('Current admin status:', this.isAdmin); 
  if (!this.isAdmin) {
    this.showError('Only group admins can add budgets');
    return;
  }
  this.isAddingBudget = true;
  this.budgetAmountInput = '';
} catch (err) {
    console.error('Failed to verify admin status:', err);
    this.showError('Failed to verify permissions');
  }
},

async submitAddBudget() {
  try {
    this.isBudgetLoading = true;

    const amount = parseFloat(this.budgetAmountInput.replace(/[^0-9.]/g, ''));

    if (isNaN(amount) || amount <= 0) {
    this.showError('Please enter a valid budget amount');
    return;
  }

    
    await this.$store.dispatch('group/addGroupBudget', {
      groupId: this.localGroupId,
      budgetAmount: amount,
      budgetName: this.budgetName || 'Group Budget',
    });

    await this.fetchBudgetData();

    this.isAddingBudget = false;
    this.budgetAmountInput = '';
    this.budgetName = '';
    this.showSuccess('Budget added successfully!');
    //this.calculateRemaining();
    
  } catch (err) {
    console.error('Failed to add budget:', err);
    this.showError(err.response?.data?.message || 'Failed to add budget. Please try again.');
  } finally {
    this.isBudgetLoading = false;
  }
},

  async fetchGroupBudget() {
  try {
    this.isBudgetLoading = true;
    const res = await this.$axios.get(
      `/api/grp_expenses/groups/${this.groupId}/budget`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
    
    if (res.data?.success) {
      if (res.data.data) {
        // Budget exists
        this.budgetName = res.data.data.budget_name || '';
        this.calculateRemaining();
      } else {
        // No budget exists yet
        this.hasBudget = false;
      }
    }
  } catch (err) {
    if (err.response?.status === 404) {
      // No budget exists
      this.hasBudget = false;
    } else {
      console.error("Failed to fetch budget:", err);
      this.showError("Failed to load budget information");
    }
  } finally {
    this.isBudgetLoading = false;
  }
},

async fetchBudgetData() {
  this.isBudgetLoading = true;
  try {
    const response = await this.$axios.get(
      `/api/grp_expenses/groups/${this.localGroupId}/budget`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );

    if (response.data?.success) {
      this.$store.commit('group/SET_GROUP_BUDGET', response.data.data);
      this.calculateRemaining();
    } else {
      this.$store.commit('group/SET_GROUP_BUDGET', null);
    }
  } catch (error) {
    if (error.response?.status === 404) {
      this.$store.commit('group/SET_GROUP_BUDGET', null);
    } else {
      console.error('Failed to fetch budget:', error);
      this.showError("Failed to load budget information");
    }
  } finally {
    this.isBudgetLoading = false;
  }
},

async updateBudget() {
    const amount = parseFloat(this.budgetAmountInput.replace(/[^0-9.]/g, ''));

    if (isNaN(amount) || amount <= 0) {
      this.showError('Please enter a valid budget amount');
      return;
    }

    try {
      this.isBudgetLoading = true;
      
      await this.$store.dispatch('group/updateGroupBudget', {
      groupId: this.localGroupId,
      budgetAmount: amount,
      budgetName: this.budgetName || 'Group Budget'
    });

      this.calculateRemaining();
      this.isEditingBudget = false;
      this.showSuccess('Budget updated successfully!');
    } catch (err) {
      console.error('Failed to update budget:', err);
      this.showError(err.response?.data?.message || 'Failed to update budget');
    } finally {
      this.isBudgetLoading = false;
    }
  },

  calculateRemaining() {
    if (!this.hasBudget || isNaN(this.budgetAmountValue)) {
      this.remainingBudget = 0;
      this.budgetProgress = 0;
      return;
    }
    
    this.remainingBudget = this.budgetAmountValue - this.totalAmount;
    const progress = (this.totalAmount / this.budgetAmountValue) * 100;
    this.budgetProgress = Math.min(progress, 100);
    
    if (this.remainingBudget < 0) {
      this.showBudgetExceededAlert = true;
      this.budgetExceededMessage = `Warning: Budget exceeded by ${this.formatPHP(Math.abs(this.remainingBudget))}`;
    }
  },

  updateTotalAmount() {
  this.totalAmount = this.expenses.reduce((total, expense) => total + expense.amount, 0);
  this.calculateRemaining();
},

  showSuccess(message) {
    this.budgetSuccessMessage = message;
    this.budgetHideMessage = false;
    setTimeout(() => this.budgetHideMessage = true, 3000);
  },

  formatCurrencyInput() {
  // Convert to string if it's not already
  const inputStr = String(this.budgetAmountInput || '');
  this.budgetAmountInput = inputStr.replace(/[^\d.]/g, '');
},

    toggleGroupList() {
      this.showGroupList = !this.showGroupList;
      if (this.showGroupList && this.userGroups.length === 0) {
        this.fetchUserGroups();
      }
    },
    
    async fetchExchangeRate() {
      if (this.lastExchangeRateUpdate && 
      new Date() - this.lastExchangeRateUpdate < 86400000) {
    return;
  }
  
    try {
      const response = await this.$axios.get('https://api.exchangerate.host/latest?base=PHP&symbols=USD');
      this.exchangeRate = response.data.rates.USD;
      console.log('Current exchange rate:', this.exchangeRate);
    } catch (err) {
      console.error('Failed to fetch exchange rate, using default', err);
      this.exchangeRate = 0.018045;
    }
  },

    async fetchUserGroups() {
      try {
        const response = await this.$axios.get('/api/grp_expenses/my-groups', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        });
        
        if (response.data.success) {
          this.userGroups = response.data.data;
          localStorage.setItem('userGroups', JSON.stringify(response.data.data));
          const updatedGroup = response.data.data.find(g => g.id === this.localGroupId);
      if (updatedGroup && this.group.id === this.localGroupId) {
        this.$store.commit('group/SET_GROUP', updatedGroup);
      }
    }
  } catch (err) {
    console.error('Failed to fetch user groups:', err);
  }
},
    
    navigateToGroup(groupId) {
      this.showGroupList = false;

      if (groupId !== this.$route.params.groupId) {
        this.$router.push({
          name: 'Group',
          params: { groupId }
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            console.error('Navigation error:', err);
            this.$notify({
              title: 'Error',
              message: 'Failed to navigate to group',
              type: 'error'
            });
          }
        });
      }
    },

    goToGroupManagement() {
      this.$router.push({ 
        name: 'GC',
        query: { fromGroup: 'true' } 
      });
    },

    async initializeGroupData() {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('jsontoken');

      if (!user || !token) {
        this.$router.push('/login');
        return;
      }

      if (!this.localGroupId) {
        this.$router.push('/GC');
        return;
      }

      try {
        // First verify membership and get role/status
        const membershipResponse = await this.$axios.get(
          `/api/grp_expenses/${this.localGroupId}/verify-membership`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        // Check for pending request
        if (membershipResponse.data.hasPendingRequest) {
          localStorage.setItem('pendingGroupId', this.localGroupId);
          this.$router.push({
            name: 'GC',
            query: { fromGroup: 'true' }
          });
          return;
        }

        // Admin should always have access regardless of status
        const isAdmin = membershipResponse.data.role === 'admin';
        
        // For non-admins, check if they're active members
        if (!isAdmin && (!membershipResponse.data.isMember || membershipResponse.data.status !== 'active')) {
          this.$notify({
            title: 'Access Denied',
            message: 'You do not have access to this group',
            type: 'error'
          });
          this.$router.push('/GC');
          return;
        }

        // Initialize group data here...
        await this.fetchGroupData();
      } catch (err) {
        console.error('Failed to initialize group data:', err);
        this.$router.push('/GC');
      }
    },
    
    async fetchGroupData() {
 const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    console.error('No user found in localStorage. Redirecting to login...');
    this.$router.push('/login'); // Redirect to login if no user
    return;
  }

  if (!this.localGroupId) {
    this.$router.push('/GC');
    return;
  }

  try {
    console.log('Fetching group data for groupId:', this.localGroupId);
    await this.fetchGroup(this.localGroupId);

    await this.fetchContributions();
    
    // Update member contributions
    this.updateMemberContributions();

    if (!this.currentGroup?.id) {
      this.$router.replace('/GC');
      return;
    }

   // this.updateMemberContributions();

  } catch (err) {
    console.error('Error fetching group:', err, {
      error: err,
      response: err.response?.data
    });
    
    this.$notify({
      title: 'Error',
      message: err.message || 'Failed to load group data',
      type: 'error'
    });

    if (err.response?.status === 401 || err.message.includes('not logged in')) {
      this.$router.push('/login');
    } else {
      this.$router.replace('/GC');
    }
  }
},
    
    async loadExpenses() {
      this.expensesLoading = true;
      this.expensesError = null;
      try {
    const monthYear = this.formatMonthYear(this.currentMonthYear);
    console.log('Loading expenses for:', this.localGroupId, monthYear);

    const response = await this.fetchExpenses({ 
      groupId: this.localGroupId, 
      monthYear 
    });
    console.log('Expenses loaded:', response);
  } catch (err) {
    console.error('Error loading expenses:', {
      error: err,
      response: err.response?.data
    });
    this.expensesError = err.response?.data?.message || 'Failed to load expenses';
  } finally {
    this.expensesLoading = false;
  }
},
    
    formatMonthYear(monthYearString) {
      const date = new Date(monthYearString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    },
    
    copyGroupCode() {
      navigator.clipboard.writeText(this.currentGroup.group_code);
      this.$notify({
        title: 'Copied!',
        message: 'Group code copied to clipboard',
        type: 'success'
      });
    },
    
    async submitExpense() {
  // Check if budget exists
  if (!this.hasBudget) {
    this.showError('Please set a group budget before adding expenses');
    return;
  }

  // Validate custom category if "Other" is selected
  if (this.newExpense.expense_type === 'Other' && !this.customExpenseType) {
    this.showError('Please enter a custom category');
    return;
  }

  try {
    const user = JSON.parse(localStorage.getItem('user'));

    // Prepare expense data with custom category handling
    const expenseData = {
      item_name: this.newExpense.item_name,
      item_price: parseFloat(this.newExpense.item_price),
      expense_type: this.newExpense.expense_type === 'Other' 
        ? this.customExpenseType 
        : this.newExpense.expense_type,
      note: this.newExpense.note, 
      group_id: this.localGroupId,
      user_id: user.id   
    };

    console.log('Submitting expense:', expenseData);

    // Add the expense
    await this.addExpense(expenseData);

    // Show success notification
    this.$notify({
      title: 'Success',
      message: 'Expense added successfully',
      type: 'success'
    });

    // Close the modal and reset form
    this.closeModal();
    this.resetNewExpense();
    this.customExpenseType = ''; // Reset custom category field

    // Reload the expenses
    await this.loadExpenses();

    // Recalculate the remaining budget
    this.calculateRemaining();

    // If the remaining budget is less than zero, show the alert
    if (this.remainingBudget < 0) {
      this.showBudgetExceededAlert = true;
    }
  } catch (err) {
    console.error('Error adding expense:', err);
    this.$notify({
      title: 'Error',
      message: err.response?.data?.message || 'Failed to add expense',
      type: 'error'
    });
  }
},

// Add this method to your component if you don't have it already
showError(message) {
  this.$notify({
    title: 'Error',
    message: message,
    type: 'error'
  });
},
    
    async submitEditExpense() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));

        const expenseData = {
          id: this.editingExpense.id,  // Assuming you're editing an existing expense, send its ID
          item_name: this.editingExpense.item_name,
          item_price: parseFloat(this.editingExpense.item_price),
          expense_type: this.editingExpense.expense_type,
          note: this.editingExpense.note,
          group_id: this.localGroupId,
          user_id: user.id   
        };

        console.log('Editing expense:', expenseData);

        // Call your API to update the expense (replace with your method)
        await this.updateExpense(expenseData);

        // Show success notification
        this.$notify({
          title: 'Success',
          message: 'Expense updated successfully',
          type: 'success'
        });

        // Close the modal and reset form
        this.closeEditModal();
        this.resetEditingExpense();

        // Reload the expenses
        await this.loadExpenses();

        this.updateTotalAmount()
        // Recalculate the remaining budget
        this.calculateRemaining();

        // If the remaining budget is less than zero, show the alert
        if (this.remainingBudget < 0) {
          this.showBudgetExceededAlert = true; // Show alert without auto hiding
        }
      } catch (err) {
        console.error('Error editing expense:', err);
        this.$notify({
          title: 'Error',
          message: err.response?.data?.message || 'Failed to update expense',
          type: 'error'
        });
      }
    },

    deleteExpenseHandler(expenseId) {
    const expense = this.expenses.find(e => e.id === expenseId);
    if (expense) {
      this.confirmDeleteExpense(expense);
    }
  },
    
  async handleUpdateExpense() {
  try {
    // Prepare the expense data with custom category handling
    const expenseData = {
      ...this.editingExpense,
      expense_type: this.editingExpense.expense_type === 'Other' 
        ? this.customExpenseType 
        : this.editingExpense.expense_type
    };

    // Call your existing updateExpense method with the modified data
    await this.updateExpense(expenseData);
    
    // Show success notification
    this.$notify({
      title: 'Success',
      message: 'Expense updated successfully',
      type: 'success'
    });
    
    // Close modal and refresh data
    this.closeModal();
    await this.loadExpenses();
    this.updateTotalAmount();
    
  } catch (err) {
    console.error('Error updating expense:', err);
    this.$notify({
      title: 'Error',
      message: err.response?.data?.message || 'Failed to update expense',
      type: 'error'
    });
  }
},
    
    confirmDeleteExpense(expense) {
      this.confirmationTitle = 'Delete Expense';
      this.confirmationMessage = `Are you sure you want to delete "${expense.item_name}" (${this.formatPHP(expense.item_price)})?`;
      this.confirmationNoteRequired = false;
      this.confirmationNote = '';
      this.confirmAction = async () => {
      try {
        await this.deleteExpense({
          expenseId: expense.id,
          groupId: this.localGroupId
        });
        this.$notify({
          title: 'Success',
          message: 'Expense deleted successfully',
          type: 'success'
        });
        await this.loadExpenses();
        this.updateTotalAmount(); // <-- Add this
        this.closeModal();
      } catch (err) {
        console.error('Error deleting expense:', err);
        this.$notify({
          title: 'Error',
          message: err.response?.data?.message || 'Failed to delete expense',
          type: 'error'
        });
      }
    };
      this.showConfirmationModal = true;
    },
    
// In your methods section of Group.vue
async sendInvite() {
  this.inviteError = '';
  this.inviteSuccess = '';
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!this.inviteEmail || !emailRegex.test(this.inviteEmail)) {
    this.inviteError = 'Please enter a valid email address';
    return;
  }

  try {
    const response = await this.$axios.post(
      `/api/grp_expenses/${this.localGroupId}/members/invite`,
      { 
        email: this.inviteEmail 
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );

    if (response.data.success) {
      this.inviteSuccess = 'Invitation sent successfully!';
      this.inviteEmail = '';
      
      // Show notification with copyable group code
      this.$notify({
        title: 'Invitation Sent',
        message: `
          <div>
            <p>Invitation sent to ${this.inviteEmail}</p>
            <div class="group-code-container" style="margin-top: 10px;">
              <p>Group Code: <strong>${this.group.group_code}</strong></p>
              <button 
                @click="copyGroupCode"
                style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;"
              >
                Copy Code
              </button>
            </div>
          </div>
        `,
        dangerouslyUseHTMLString: true,
        duration: 5000
      });
      
      setTimeout(() => {
        this.inviteSuccess = '';
      }, 3000);
    }
  } catch (err) {
    console.error('Error sending invite:', err);
    this.inviteError = err.response?.data?.message || 'Failed to send invitation';
    
    setTimeout(() => {
      this.inviteError = '';
    }, 5000);
  }
},

    
confirmRemoveMember(member) {
  this.confirmationTitle = 'Remove Member';
  this.confirmationMessage = `Are you sure you want to remove ${member.username} from the group?`;
  this.confirmationNoteRequired = true;
  this.confirmationNote = '';      
  this.confirmAction = async () => {
    try {
      await this.$axios.post(
        `/api/grp_expenses/${this.localGroupId}/members/${member.id}/remove`,
        { 
          reason: this.confirmationNote || null 
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        }
      );
          this.$notify({
            title: 'Success',
            message: 'Member removed successfully',
            type: 'success'
          });

          this.closeModal();
          await this.fetchGroupData();
        } catch (err) {
          console.error('Error removing member:', err);
          this.$notify({
            title: 'Error',
            message: err.response?.data?.message || 'Failed to remove member',
            type: 'error'
          });
        }
      };
      this.showConfirmationModal = true;
    },

    async handleNameUpdate() {
  if (!this.nameChanged) return;
  
  this.updatingName = true;
  this.nameError = '';
  
  try {
    await this.updateGroupNameLocal();
    this.originalName = this.group.group_name; 
  } catch (error) {
    this.nameError = error.message || 'Failed to update name';
    this.group.group_name = this.originalName;
  } finally {
    this.updatingName = false;
  }
},
    
    async updateGroupNameLocal() {
  if (!this.group.group_name.trim()) return;

  try {
    await this.$store.dispatch('group/updateGroupName', {
      groupId: this.localGroupId,
      name: this.group.group_name.trim()
    });

    await this.fetchUserGroups();

    this.$notify({ 
      title: 'Success', 
      message: 'Name updated!', 
      type: 'success' 
    });
  } catch (err) {
    this.$notify({ 
      title: 'Error', 
      message: 'Update failed', 
      type: 'error' 
    });
    throw err;
  }
},
    
    confirmDeleteGroup() {
      this.confirmationTitle = 'Delete Group';
      this.confirmationMessage = 'Are you sure you want to delete this group permanently? This action cannot be undone.';
      this.confirmationNoteRequired = false;
      this.confirmationNote = '';
      this.confirmAction = async () => {
        try {
          await this.deleteGroup(this.localGroupId);
          this.$notify({
            title: 'Success',
            message: 'Group deleted successfully',
            type: 'success'
          });
          this.closeModal();
          this.$router.push('/GC');
        } catch (err) {
          console.error('Error deleting group:', err);
          this.$notify({
            title: 'Error',
            message: err.response?.data?.message || 'Failed to delete group',
            type: 'error'
          });
        }
      };
      this.showConfirmationModal = true;
    },
    
    canEditExpense(expense) {
  const userId = JSON.parse(localStorage.getItem('user')).id;
  return expense.user_id === userId; 
  },
    
    closeModal() {
      this.showAddExpenseModal = false;
      this.showEditExpenseModal = false;
      this.showConfirmationModal = false;
    },
    
    resetNewExpense() {
  this.newExpense = {
    item_name: '',
    item_price: 0,
    expense_type: 'Food',
    group_id: this.localGroupId
  };
},

beforeRouteEnter(to, from, next) {
  next(async vm => {
    const inviteToken = to.query.inviteToken;
    if (inviteToken) {
      try {
        const response = await vm.$axios.get(
          `/api/grp_expenses/invite/accept?token=${inviteToken}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
            }
          }
        );

if (response.data.success) {
          if (response.data.requiresAuth) {
            localStorage.setItem('invitationToken', inviteToken);
            vm.$router.replace({
              path: '/login',
              query: { 
                redirect: to.path,
                inviteToken: inviteToken 
              }
            });
            return;
          }
          
          localStorage.removeItem('invitationToken');
          
          if (!to.params.groupId && response.data.data.groupId) {
            to.params.groupId = response.data.data.groupId;
          }
        }
      } catch (err) {
        console.error('Route guard invitation error:', err);
      }
    }
    
    if (!to.params.groupId) {
      next('/GC');
      return;
    }
    });
},

  beforeRouteUpdate(to, from, next) {
  if (!to.params.groupId) {
    this.$router.replace('/GC');
    return;
  }
  
  // Clear existing data
  this.contributionHistory = [];
  this.contributions = [];
  this.memberContributions = [];
  this.paidAmountInput = 0;
  this.groupPhotos = []; 
  
  this.localGroupId = to.params.groupId; 

  const inviteToken = to.query.inviteToken;
  if (inviteToken) {
    localStorage.setItem('invitationToken', inviteToken);
  }

  Promise.all([
    this.initializeGroupData(),
    this.fetchPhotos() // Explicitly fetch photos
  ]).finally(() => next());
}
}
};
</script>

<style scoped>
.requests-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa; /* light gray */
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 14px 18px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
}

.request-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.request-user {
  font-weight: 600;
  color: #333;
}

.request-email {
  font-size: 13px;
  color: #555;
}

.request-date {
  font-size: 12px;
  color: #888;
}

.request-actions {
  display: flex;
  gap: 10px;
}

.approve-button,
.reject-button {
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s ease;
}

/* Approve Button */
.approve-button {
  background-color: #d4edda;
  color: #155724;
}

.approve-button:hover {
  background-color: #c3e6cb;
}

/* Reject Button */
.reject-button {
  background-color: #f8d7da;
  color: #721c24;
}

.reject-button:hover {
  background-color: #f5c6cb;
}
.contributions-disabled-notice {
  background-color: #e3f3ee;
  padding: 10px;
  margin: 10px auto;             
  border-radius: 4px;
  color: #2c3e50;                 
  font-size: 0.9rem;
  text-align: center;
  width: fit-content;
  max-width: 100%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* subtle shadow */
}

.contributions-disabled-notice i {
  color: #2c3e50;                  /* match white tone */
  margin-right: 8px;
}

.disabled-btn {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #e0e0e0 !important;
}

/* Add to your styles */
.blocked-members-section {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.btn-blocked-members {
  background: #f6fafd;
  border: 1px solid #6a9c89;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 15px;
  font-weight: 500;
  color: #22684d;
  transition: 
    background-color 0.3s ease, 
    box-shadow 0.3s ease, 
    transform 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.btn-blocked-members:hover {
  background: #e0f1ef;
  box-shadow: 0 4px 10px rgba(38, 102, 94, 0.1);
  transform: translateY(-1px);
}


.blocked-members-list {
  margin-top: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
  border: 2px dashed #ced4da;
  border-radius: 8px;
}

.blocked-member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.blocked-member-item:last-child {
  border-bottom: none;
}

.blocked-info {
  font-size: 0.8em;
  color: #666;
  margin-top: 5px;
}

.blocked-info span {
  display: block;
}

.unblock-button {
  background: #3e3f3f;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.unblock-button:hover {
  background: #737474;
}

.unblock-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.no-blocked-members {
  padding: 1.2rem;
  margin: 1rem;
  text-align: center;
  color: #6c757d;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-size: 15px;
  font-style: italic;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.modal-overlay10 {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content10 {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.invite-item10 {
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
}

.accept-button10 {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.close-button10 {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
}
.image-container {
  width: 100%;
  height: 250px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  position: relative;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.2s ease;
  transform-origin: center center;
}

.zoom-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.zoom-btn {
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.zoom-btn:hover {
  background: #e0e0e0;
}

.photo-view-modal .modal-content5 {
  max-width: 800px;
}
/* Photos Tab Styles */
.modal-overlay5 {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content5 {
  background-color: #f9fefc;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  margin: 60px auto;
  padding: 0;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-height: 90vh; 
}

.modal-header5 {
  padding: 35px 30px; 
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 3px solid #4f7a6b;
  background: linear-gradient(135deg, #b8f0db, #9fe3c9, #94dfd3);
  box-shadow: inset 0 -4px 6px rgba(0,0,0,0.1);
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.modal-header5 h3 {
  position: absolute;
  text-align: center;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  font-size: 1.6rem;
  text-shadow: 2px 1px 3px rgba(0, 0, 0, 0.427);
}

.modal-header6 {
  padding: 35px 30px; 
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 3px solid #4f7a6b;
  background: linear-gradient(135deg, #8bbcae, #6a9c89);
  box-shadow: inset 0 -4px 6px rgba(0,0,0,0.1);
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.modal-header6 h3 {
  position: absolute;
  left: 40%;
  transform: translateX(-50%);
  margin: 0;
  font-size: 1.6rem;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.modal-header6 .close-button {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #e4f9e4;
  transition: color 0.3s ease;
  padding: 5px;
  border-radius: 50%;
}

.modal-header6 .close-button:hover {
  color: #f9fefc;
  background: rgba(255, 255, 255, 0.15);
}
.modal-header5 .close-button {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #e4f9e4;
  transition: color 0.3s ease;
  padding: 5px;
  border-radius: 50%;
}

.modal-header5 .close-button:hover {
  color: #f9fefc;
  background: rgba(255, 255, 255, 0.15);
}

.modal-body5 {
  padding: 16px 20px;
  background-color: #FBFFFC; 
}

.form-group5 {
  margin-bottom: 15px;
}

.form-group5 label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
  color: #2a646d;
}

.form-group5 textarea {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  height: 60px;
}

.form-group5 input {
  width: 96%;
  padding: 8px;
  border: 1px solid #c0c0c0;
  border-radius: 4px;
}
.photos-tab {
  padding: 20px;
  max-height: 680px;
  overflow-y: auto;
}

.photos-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-top: -30px;
  margin-bottom: 20px;
}

.upload-photo-btn {
  background: linear-gradient(135deg, #9fccbd, #6eb3a3, #82b2a1);
  color: white;
  font-size: 14px;
  border: none;
  padding: 10px 30px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.307);
}

.upload-photo-btn:hover {
  background: linear-gradient(135deg, #b9e1d5, #a7d2c6, #8bbcae);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.photo-card {
  border: 2px solid #4f7a6b;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.photo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.photo-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.photo-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s;
}

.photo-thumbnail:hover {
  transform: scale(1.05);
}

.photo-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.photo-actions {
  position: absolute;
  top: 10px;
  right: 10px;
}

/* EDIT BUTTON */
.edit-photo-btn {
  background: linear-gradient(135deg,#a7d1c3, #8bbcae, #6a9c89 );
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-4px); /* Slight lift */
  transition: background 0.3s ease;
}

.edit-photo-btn:hover {
  background: linear-gradient( 135deg, #9fcfc1,#7fb1a3, #5e8f7d );
}


/* DELETE BUTTON */
.delete-photo-btn {
  background: linear-gradient(135deg,rgba(255, 102, 102, 0.9),rgba(255, 80, 80, 0.9),rgba(200, 40, 40, 0.9) );
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.delete-photo-btn:hover {
  background: linear-gradient(135deg,rgba(255, 120, 120, 1),rgba(255, 60, 60, 1),rgba(180, 30, 30, 1) );
}


.photo-meta {
  padding: 10px;
  background: #f5fbf9; /* very light greenish background */
  border: 1px solid #d6e8e2;
  border-radius: 6px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.03);
  font-family: 'Segoe UI', sans-serif;
}


.photo-description {
  margin: 0 0 10px 0;
  font-weight: 500;
  font-size: 14px;
  color: #4f7a6b;
  font-style: italic;
  letter-spacing: 0.3px;
}

.photo-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
}


.photo-uploader, .photo-date {
  font-size: 13px;
  color: #666;
  margin: 3px 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Photo Upload Modal */
.photo-upload-modal {
  max-width: 430px;
}

.photo-edit-modal {
  max-width: 400px;
}

.photo-preview {
  margin-top: 10px;
  max-height: 300px;
  overflow: hidden;
}
.photo-preview img {
  width: 100%;
  height: auto;
  max-height: 100px;
  object-fit: contain;
}

.photo-preview1 {
  margin-top: 8px;
  max-height: 150px; /* Reduced from 300px */
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.photo-preview1 img {
  width: auto;
  height: auto;
  max-height: 100px; /* Smaller image height */
  max-width: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.current-photo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.current-photo img.photo-thumbnail {
  width: auto;
  height: auto;
  max-height: 100px; /* Same height to match preview */
  max-width: 100%;
  object-fit: contain;
  border-radius: 8px;
}
/* Photo View Modal */
.photo-view-modal .modal-content5 {
  max-width: 60%;
  max-height: 90vh;
}

.photo-view-modal img {
  max-width: 100%;
  max-height: 50vh;
  display: block;
  margin: 0 auto;
}

.photo-details {
  margin-top: 15px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #eef9f5, #d9f2ea); 
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  font-size: 14px;
  color: #3c4c47;
  transition: background 0.3s ease;
}

.no-photos {
  text-align: center;
  padding: 40px;
  color: #4f7a6b;
  background: linear-gradient(135deg, #f0f9f6, #e5f3ef);
  border: 2px dashed #8bbcae;
  border-radius: 8px;
  font-size: 1.1em;
  font-style: italic;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: background 0.3s ease;
}

.close-button2 {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #1a1a1a; /* deep black for a sleek look */
  transition: transform 0.2s ease, opacity 0.2s ease;
  opacity: 0.8;
}

.close-button2:hover {
  transform: translateY(-50%) scale(1.2);
  opacity: 1;
}

/* Voice Input Styles */
.voice-help-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.voice-help-content {
  background-color: #fefefe;
  border-radius: 16px;
  width: 90%;
  max-width: 440px;
  max-height: 70vh; 
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modalFadeIn 0.3s ease-out;
  font-family: "Segoe UI", sans-serif;
  display: flex;
  flex-direction: column;
}


.voice-help-header {
  background: linear-gradient(135deg, #8bbcae, #6a9c89, #4f7a6b);
  color: white;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.voice-help-header h3 {
  margin: 0;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 5px;
  transition: transform 0.2s;
}

.close-btn:hover {
  transform: scale(1.2);
}

.voice-help-body {
  padding: 18px 20px;
  max-height: 55vh;
  overflow-y: auto;
}

.voice-command {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}

.command-prefix {
  font-size: 1.4rem;
  color: #6a9c89;
  margin-right: 12px;
}

.command-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.command-example {
  font-weight: 600;
  color: #4f7a6b;
  font-family: 'Courier New', monospace;
  font-size: 0.93rem;
}

.command-description {
  color: #555;
  font-size: 0.88rem;
}

.voice-help-footer {
  padding: 14px 20px;
  background-color: #f0f2f1;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #ddd;
}

.btn-ok {
  background-color: #6a9c89;
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s, transform 0.2s;
}

.btn-ok:hover {
  background-color: #4f7a6b;
  transform: translateY(-2px);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.voice-help-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #8bbcae, #6a9c89, #4f7a6b);
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
  font-size: 0.9rem;
}

.voice-help-btn:hover {
  background: #8bbcae;
}

/* Animation */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .voice-help-content {
    width: 95%;
  }
  
  .command-details {
    flex-direction: column;
  }
}
.input-with-voice {
  position: relative;
  display: flex;
  align-items: center;
}

.voice-btn {
  background: #f0f0f0;
  border: 1px solid  #6a9c89;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  margin-left: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.voice-btn:hover {
  color: #42b983;
}

.voice-btn.active {
  background: #ff4444;
  color: white;
  animation: pulse 1.5s infinite;
}

.voice-controls {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.voice-control-btn {
  padding: 10px 15px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.voice-control-btn.active {
  background: #ff4444;
}

.voice-feedback {
  margin-top: 10px;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.voice-input-preview {
  font-style: italic;
  color: #666;
}

.voice-help-text {
  font-size: 0.8em;
  color: #999;
  margin-top: 5px;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
.no-budget {
  background-color: #f4f8f6;
  border: 1px dashed #b6cfc5;
  padding: 16px 24px;
  border-radius: 8px;
  text-align: center;
  color: #4e7e6a;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  margin-top: 20px;
}

.no-budget p {
  margin: 0;
  font-size: 1rem;
}
.no-contributions {
  background-color: #f0f7f4;
  border: 1px solid #c8e3d5;
  border-radius: 12px;
  padding: 20px;
  margin: 20px auto;
  max-width: 500px;
  text-align: center;
  color: #2a4935;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
}
.button-edit, .button-delete {
  padding: 6px 14px;
  font-size: 0.9rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.2s;
  min-width: 70px;
}

/* Edit button - your greenish color */
.button-edit {
  background: linear-gradient(135deg, #8bbcae, #6a9c89, #4f7a6b);
  color: white;
  box-shadow: 0 2px 5px rgba(106, 156, 137, 0.4);
}

.button-edit:hover:not(:disabled) {
  background: linear-gradient(135deg, #7aa98c, #5e8873, #486858);
  box-shadow: 0 4px 10px rgba(74, 109, 92, 0.6);
}

/* Delete button - complementary red */
.button-delete {
  background: linear-gradient(135deg, #e57373, #d32f2f, #b71c1c);
  color: white;
  box-shadow: 0 2px 5px rgba(211, 47, 47, 0.4);
}

.button-delete:hover:not(:disabled) {
  background: linear-gradient(135deg, #d32f2f, #b71c1c, #7f0000);
  box-shadow: 0 4px 10px rgba(123, 0, 0, 0.6);
}

/* Disabled state for both buttons */
.button-edit:disabled,
.button-delete:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
  background: #ccc;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.con-contribution {
  background: linear-gradient(135deg, #f5fbf8, #e8f7ef);
  border: 2px solid #a8e0ce;
  border-radius: 16px;
  padding: 30px 40px;
  width: 100%;
  max-width: 450px;
  margin: 100px auto;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 10px 28px rgba(44, 88, 73, 0.08);
  text-align: left;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.con-contribution h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2a4935;
  margin-bottom: 20px;
  margin-top: 0px;
}

.btn-save-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.btn-save {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #afd7c9, #62a293, #8fbdad);
  color: #fff;
  padding: 10px 18px;
  font-size: 0.9rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 4px 6px rgba(106, 156, 137, 0.4);
  text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.352);
  transition: background 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
  min-width: 160px;
}

.btn-save:hover {
  background: linear-gradient(135deg, #94b6aa, #4a7a6f, #73988b);
  box-shadow: 0 6px 12px rgba(74, 109, 92, 0.5);
}


.btn-save:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-save1 {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #afd7c9, #62a293, #8fbdad);
  color: #fff;
  padding: 10px 18px;
  font-size: 0.9rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 4px 6px rgba(106, 156, 137, 0.4);
  transition: background 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
  min-width: 160px;
}

.btn-save1:hover {
  background: linear-gradient(135deg, #94b6aa, #4a7a6f, #73988b);
  box-shadow: 0 6px 12px rgba(74, 109, 92, 0.5);
}


.btn-cancel {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-left: 10px;
}

.contribution-form {
  background: #fff;
  padding: 100px;
  border-radius: 20;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  border: 2px solid #021526;
}

.contribution-form .form-group {
  margin-bottom: 15px;
}

.contribution-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.contribution-form input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.contribution-history {
  margin-top: 10px;
  border-top: 1px solid #dcdcdc;
  padding-top: 15px;
  background-color: #fafafa;
  border-radius: 6px;
  box-shadow: inset 0 1px 4px #93b9a9a8;
}

.contribution-history h4 {
  margin-bottom: 10px;
  margin-top: 2px;
  color: #2c3e50;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.contribution-list {
  list-style: none;
  padding: 0 10px;
  margin: 0;
  max-height: 250px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.contribution-list li {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: center;
  padding: 10px 5px;
  border-bottom: 1px solid #eaeaea;
  font-size: 0.98rem;
  color: #2c3e50;
  transition: background-color 0.2s;
}

.contribution-list li:hover {
  background-color: #f3f9ff;
}

.contribution-date,
.contribution-amount {
  text-align: left;
  font-size: 0.97rem;
}

.status-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.completed {
  background-color: #e6f7ee;
  color: #10b981;
}

.status-badge.pending {
  background-color: #fff3e6;
  color: #f59e0b;
}

.contribution-tab {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px #005a425a;
}

.contribution-header {
  margin-bottom: 30px;
  text-align: center;
}

.contribution-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: none;
  background: none;
  color: #2c3e50;
  border: none;
  margin-bottom: 10px;
}

.contribution-header p {
  font-size: 1rem;
  color: #6c757d;
  margin: 0;
}

.contribution-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); /* slightly smaller min */
  gap: 15px;
  margin-bottom: 30px;
}

  .summary-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 10px 15px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  border-bottom: 4px solid #c4c4c4;
}

.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* hover lift effect */
}

.summary-label {
  font-size: 1.0rem;
  color: #6c757d;
  margin-bottom: 10px;
}

.summary-amount {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;

}

.text-danger {
  color: #e74c3c;
}

.text-success {
  color: #27ae60;
}
.contribution-form {
  max-width: 600px;
  min-height: 250px;
  max-height: 600px;
  margin: 0 auto 40px;
  padding: 20px;
  background: #fcfeff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.277);
  border: none;
  border-radius: 8px;
}

.contribution-form h3 {
  margin-top: 5px;
  color: #2c3e50;
  text-align: center;
}
.member-contributions-table {
  overflow-x: auto;
  margin-bottom: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 5px #93b9a9a8;
  background-color: #ffffff;
  padding: 8px; 
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.member-contributions-table table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 6px; 
  font-size: 0.95rem;
}

.member-contributions-table th,
.member-contributions-table td {
  padding: 10px 14px; /* reduced padding */
  text-align: center;
  border-bottom: 1px solid #d7e2dc;
  vertical-align: middle;
  user-select: none;
}

.member-contributions-table th {
  background: linear-gradient(135deg, #8bbcae, #6a9c89, #4f7a6b);
  color: white;
  font-weight: 700;
  font-size: 1rem; /* slightly smaller */
  text-transform: uppercase;
  border-bottom: 2px solid #4f7a6b;
  box-shadow: 0 2px 6px rgba(74, 109, 92, 0.3);
  border-radius: 8px 8px 0 0;
}

.member-contributions-table tbody tr {
  background-color: #ecfdf5;
  box-shadow: 0 1px 3px rgba(106, 156, 137, 0.1);
  border-radius: 6px;
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
}

.member-contributions-table tbody tr:nth-child(even) {
  background-color: #daf0de;
}

.member-contributions-table tbody tr:hover {
  background-color: #c7e6e0;
  box-shadow: 0 4px 10px rgba(74, 109, 92, 0.2);
  transform: translateY(-2px);
  transition: all 0.25s ease;
}


.status-badge {
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-block;
}

.status-badge.completed {
  background-color: #d4f4dd;
  color: #219653;
}

.status-badge.pending {
  background-color: #ffe8cc;
  color: #e67e22;
}



.leave-group-section,
.admin-leave-notice {
  margin: 20px auto 0px auto;
  padding: 2px 20px;
  max-width: 400px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f4fdf9;
  background-image: linear-gradient(145deg, #ffffff, #ecf5f0);
  border: 1px solid #cdd8d2;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(106, 156, 137, 0.344);
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.leave-group-section:hover,
.admin-leave-notice:hover {
  box-shadow: 0 6px 16px rgba(106, 156, 137, 0.15);
  transform: translateY(-2px);
}



.leave-group-section h4,
.admin-leave-notice h4 {
  color: #343a40;
  margin-bottom: 12px;
  font-size: 1.05rem;
  display: flex;
  align-items: center;
}

.leave-group-button {
  background: linear-gradient(135deg, #dc3545, #b52a37);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  margin: 10px auto;
  box-shadow: 0 2px 6px rgba(220, 53, 69, 0.3);
}

.leave-group-button:hover {
  background: linear-gradient(135deg, #b52a37, #a51e2e);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(220, 53, 69, 0.4);
}

.leave-group-warning {
  margin-top: 8px;
  color: #6c757d;
  font-size: 0.85rem;
  line-height: 1.4;
  text-align: center;
  max-width: 320px;
}

.admin-leave-notice p {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 10;
  text-align: center;
  max-width: 350px;
}

.fa-sign-out-alt,
.fa-info-circle {
  margin-right: 8px;
  font-size: 1.1rem;
}

.fa-sign-out-alt {
  color: #dc3545;
}

.fa-info-circle {
  color: #17a2b8;
}

.promote-success-message {
  background: linear-gradient(135deg, #8bbcae, #6a9c89, #4f7a6b);
  color: white;
  padding: 12px 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: fadeIn 0.3s ease-in-out;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.promote-success-message i.fa-check-circle {
  margin-right: 10px;
  font-size: 1.2em;
  color: #e6f4ef; /* light soft contrast to blend well with the background */
}

.close-message {
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 0;
  margin-left: 15px;
  font-size: 1.2em;
  transition: color 0.2s ease;
}

.close-message:hover {
  color: #d0eae0; /* soft hover effect */
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.role-badge.admin {
  background-color: #ffeb3b;
  color: #000;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.fa-crown {
  color: #ff9800;
}

.member-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.promote-button {
  background: linear-gradient(135deg, #6a9c89, #4f7a6b); /* using your chosen green gradient */
  color: #ffffff;
  border: none;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 5px;
  font-weight: 600;
  font-size: 0.8rem;
  box-shadow: 0 2px 5px rgba(106, 156, 137, 0.25);
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
}

.promote-button:hover {
  background: linear-gradient(135deg, #4f7a6b, #3f6659);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(79, 122, 107, 0.4);
}

.group-header-decoration {
  height: 4px;
  background: linear-gradient(90deg, #2a4935 0%, #4a8c61 100%);
  margin-bottom: 25px;
  border-radius: 2px;
}

.floating-alert {
  position: fixed;
  top: 50%; 
  left: 50%; 
  transform: translate(-50%, -50%); 
  display: flex;
  flex-wrap: wrap;
  justify-content: center; 
  align-items: center; 
  background-color: #ffebee;
  border: 1px solid #ef9a9a;
  color: #c62828;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-height: 50px;
  font-size: 20px;
}

.alert-content i {
  color: #cc0000;
  font-size: 28px;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.alert-content i {
  color: #cc0000;
}

.close-alert-btn {
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  
}

.close-alert-btn:hover {
  color: #cc0000;
}

.group-con {
  display: flex;
  flex-wrap: nowrap; /* prevent wrapping by default */
  gap: 20px;
  width: 100%;
  flex-direction: row;
}

.budget-total-container {
  min-width: 30%;
  box-sizing: border-box;
}

.budget-container {
  background: #fcfeff;
  padding: 20px;
  border-radius: 15px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.277);
  color: white;
  min-height: 250px;
  max-height: 600px;
  margin-bottom: 20px;
}

.budget-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  gap: 10px;
}

.budget-header h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}
.btn-add, .btn-edit {
  background: linear-gradient(135deg, #9fccbd, #6eb3a3, #82b2a1);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-add:hover, .btn-edit:hover {
  background: #dcdcdc;
  color: #333;
  transform: translateY(-2px);
}

.budget-display {
  transition: margin-top 0.3s ease;
  margin-top: 0;
  flex-wrap: wrap;
  background: rgba(115, 115, 115, 0.096);
  padding: 20px;
  border-radius: 10px;
}

.budget {
  background-color: #ffffff;           
  border: 2px solid #6A9C89;           
  padding: 12px 16px;
  border-radius: 10px;
  color: #388e3c;                      
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-weight: 650;
  font-size: 18px;
}

.budget-details {
  color: #1d4d2b;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.budget-name,
.budget-amount {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
}

.budget-name span,
.budget-amount span {
  color: #307968;   
}

.budget-name strong,
.budget-amount strong {
  color:  #307968;
  font-weight: bold;
}

.expenses-summary1 {
  background-color: #f5f5f5;
  border: 2px solid #697565;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.total-expenses,
.remaining-budget {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  color: #444;
}

.total-expenses span,
.remaining-budget span {
  color: #444;
}

.total-expenses strong,
.remaining-budget strong {
  font-weight: bold;
  color: #444;
}

.remaining-budget strong.text-danger {
  color: #d32f2f;
}
.progress-bar {
  width: 100%;
  height: 12px !important;
  background-color: #e0e0e0;
  border-radius: 70px !important;
  overflow: hidden;
}

.progress-fill {
  height: 100%; 
  background: linear-gradient(135deg, #7aa98c, #5e8873, #486858);
  transition: width 0.3s;
}

.progress-fill.exceeded {
  background: #f44336 !important;
}

.progress-text {
  color: #2a4935;
  text-align: right;
  font-size: 1rem; /* Slightly bigger */
  margin-top: 6px;  /* Adds spacing below the bar */
}

.budget-form-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

h2 {
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.222);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.396);
  letter-spacing: 0.5px;
  border: none;
  background: linear-gradient(135deg, #ace1ce, #8dd2b8, #78bdb1);
}

.budget-form {
  background-color: #fafffb;
  border: none;
  color: #333;
  padding: 25px;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  min-width: 200px;
}

.budget-form .form-group {
  margin-bottom: 15px;
  margin-top: 20px;
}

.budget-form label {
  display: block;
  margin-bottom: 5px;
}

.budget-form input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-cancel:hover {
  background-color: #4b5256;
}

.budget-success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  text-align: center;
  transition: opacity 0.5s ease;
  opacity: 1;
}

.budget-success-message.hide {
  opacity: 0;
  pointer-events: none;
}

.group-wrapper {
  min-width: 65%;
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  max-width: 1000px;
}

.group-body {
  background: #fbffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.277);
  border: none; 
  padding: 30px;
  margin-bottom: 20px;
}

.total-summary {
  text-align: center;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
}

.total-amount-card {
  background: #d1e7e4;
  border-radius: 10px;
  height: 70px;
  padding: 14px 16px;
  width: 100%;
  box-shadow: 0 4px 10px #93b9a9e1;
  box-sizing: border-box;
  text-align: center;
}

.total-label {
  font-size: 1.2rem;
  color: #5a6a7a;
  margin-bottom: 8px;
  margin-top: -7px;
  font-weight: 500;
}

.amount-display {
  display: flex;
  flex-direction: row;
  gap: 5px;
  justify-content: center; /* centers items horizontally */
  align-items: center;     /* centers items vertically (optional) */
  text-align: center; 
}

.currency {
  font-size: 1.4rem;
  font-weight: 600;
}

.currency.php {
  color: #2a4935;
}

.currency.usd {
  color: #4a6fa5;
  font-size: 1.2rem;
}

.retry-btn {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.retry-btn:hover {
  background-color: #1565c0;
}

.expenses-section {
  overflow-x: auto;
  text-align: center;
  margin-bottom: 20px;
}

.expenses-container h3 {
    display: inline-block;
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    padding: 25px 0px 25px 0px;
    border-radius: 8px;
    animation: fadeSlideIn 0.6s ease-out;
    box-shadow: 0 2px 8px #00000059;
    text-align: center;
    letter-spacing: 1px;
    margin-bottom: 0px;
    width: 100%;
  }

.expenses-table {
  max-height: 500px;  
  overflow-y: auto;
  margin-bottom: 20px;
}

.expenses-table table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px; 
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden; 
  box-shadow: 0 2px 10px rgba(76, 132, 96, 0.536); 
}

.expenses-table th,
.expenses-table td {
  padding: 6px 20px;
  text-align: center;
  font-size: 0.95rem;
  color: #444;
  border-bottom: 2px solid #d3d3d3;
  vertical-align: middle;
  user-select: none;
}

.expenses-table th {
  background: linear-gradient(135deg, #6fcfa5, #3ea799);
  font-size: 0.8rem;
  padding: 12px 20px;
  color: white;
  text-transform: uppercase;
  border-bottom: 2px solid #4f7a6b;    
  border-radius: 14px 14px 0 0;
  position: sticky;
  top: 0;
  font-weight: 600;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 4px rgba(74, 109, 92, 0.2);  /* subtle green tinted shadow */
}

.expenses-table tbody tr {
  background-color: #fbfbfb;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  transition: all 0.25s ease;
  cursor: default;
}

.expenses-table tbody tr:hover {
  background-color: #ecfff7;
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.12);
}

.expenses-table tbody tr td:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.expenses-table tbody tr td:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.actions {
  vertical-align: middle; /* Keep table alignment intact */
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.edit-btn, .delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.edit-btn {
  background: none;
  border: none;
  color: #307968;        
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  transition: color 0.2s;
}

.edit-btn:hover {
  color: #8bbcae;        /* lighter shade for hover */
}


.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

.edit-btn:disabled, 
.delete-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.total {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 16px;
  text-align: right;
}

.no-expenses {
  text-align: center;
  padding: 30px;
  color: #666;
}
.input-group {
  display: flex;
  gap: 8px;
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.group-content {
  width: 100%;
      background: linear-gradient(135deg, #fdfffe, #ecf9f6, #def4f1);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.241);
  border: none;
  padding: 20px;
  margin-bottom: 20px;
}

.group-header {
  margin-bottom: 5px;
  margin-left: 10px;
}

.header-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 15px;
}

.group-title-section {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.group-name {
  font-size: 1.8rem;
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
}

.group-code-badge {
  display: flex;
  align-items: center;
  background: #e8f0ee;
  padding: 10px 16px; 
  border-radius: 20px; 
  font-size: 1.0rem; 
  gap: 10px; 
  background-color: #d1f0e6; 
  color: #2a4935; 
  font-weight: 500; 
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
  transition: all 0.3s ease;
}

.group-code-badge:hover {
  background-color: #b9e8d8; 
  transform: translateY(-2px); 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); 
}

.copy-button {
  background: none;
  border: none;
  color: #2a4935;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
  transition: transform 0.2s;
}

.copy-button:hover {
  transform: scale(1.1);
}

.group-action-buttons {
  display: flex;
  gap: 12px;
}

.my-groups-btn {
  background-color: #589083; 
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.my-groups-btn:hover {
  background-color: #1e3a27;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.manage-groups-btn {
  background: #4CAF50;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.manage-groups-btn:hover {
  background: #3e8e41;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.group-meta-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  color: #5a6a7a;
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-item i {
  color: #6c757d;
}

.meta-item span {
  font-size: 1.1rem; 
}

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
  background: linear-gradient(135deg, #8bbcae, #6a9c89);
  color: white;
  padding: 20px 20px;
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
  background: #93b9a95b;
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
  box-shadow: 0 2px 6px #93b9a9e1;
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


.group-modal-content {
  padding: 18px;
  background-color: #fafafa;
}
.group-container {
  display: flex;
  flex-wrap: wrap;
  max-width: 90%;
  margin: 0 auto;
  padding: 120px 20px 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 20px;
  background-color: #ffebee;
  border-radius: 5px;
  margin-top: 100px;
}

.error-message {
  color: #d32f2f;
  margin-bottom: 15px;
  margin-top: 4px;
}

.retry-button {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.group-code {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-meta {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 0.9rem;
}

.group-tabs {
  display: flex;
  flex-wrap: wrap;
  border-bottom: 2px solid  #d5d4d4;
  margin-bottom: 30px;
  gap: 30px;
}

.group-tabs button {
  padding: 12px 24px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  position: relative;
  color: #666;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 6px 6px 0 0;
}

.group-tabs button:hover {
  background-color: #f5f5f5;
  color: #2a4935;
}

.group-tabs button.active {
  color: #2a4935;
  font-weight: 600;
  background-color: #f0f7f3;
}

.group-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #2a4935;
  border-radius: 3px;
}

.expense-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.add-expense-button {
  background: linear-gradient(135deg, #effdf8, #def4ee, #e5faf3);
  color: #2a4935;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 2px 5px #a6a9a8c2;
  margin: 0 auto;
  width: 100%;
  position: relative;
}

.add-expense-button:hover {
  background-color: #1e3a27;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(42, 73, 53, 0.3);
}

.add-expense-button i {
  font-size: 1.1rem;
}

.add-expense-button .tooltip {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  display: none;
}

.add-expense-button:disabled:hover .tooltip {
  display: block;
}
.expenses-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.expense-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.expense-name {
  font-weight: bold;
}

.expense-user {
  font-size: 0.8rem;
  color: #666;
}

.expense-type {
  font-size: 0.8rem;
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 10px;
  display: inline-block;
}

.expense-amount {
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}

.expense-actions {
  display: flex;
  gap: 5px;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.action-button.edit:hover {
  color: #1976d2;
}

.action-button.delete:hover {
  color: #d32f2f;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: linear-gradient(135deg, #edf9f2, #ecf9f6); 
  border-radius: 12px; 
  box-shadow: 0 2px 5px #93b9a9;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.member-item:hover {
  box-shadow: 0 8px 16px rgba(106, 156, 137, 0.3);
  transform: translateY(-3px);
}

.member-info {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-weight: 600;
  font-size: 1rem;
  color: #2a646d; 
}

.member-email {
  font-size: 0.8rem;
  color: #7d8c96;
  font-style: italic;
  letter-spacing: 0.03em;
}

.member-role {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-badge {
  padding: 5px 12px; /* slightly bigger padding for better pill shape */
  border-radius: 14px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 1px 3px rgba(74, 109, 92, 0.2);
  user-select: none;
}

.role-badge.admin {
  background-color: #c7e6cb;
  color: #1b5e20;
}

.role-badge.member {
  background-color: #a6c8ff;
  color: #0d47a1;
  margin-left: auto;
}

.remove-button {
  background-color: #ffd6d6;
  color: #d32f2f;
  border: none;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 1px 4px rgba(211, 47, 47, 0.2);
}

.remove-button:hover {
  background-color: #ff8a80;
  box-shadow: 0 3px 8px rgba(211, 47, 47, 0.4);
}

.block-button {
  background-color: #3e3f3f;
  border-radius: 6px;
  color: white;
}

.block-button:hover {
  background: #737474;
}

.invite-section {
  margin-top: 30px;
  padding: 25px 20px;
  background: linear-gradient(to right, #fdfffe, #ecf9f6, #def4f1);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.348);
  border-left: 4px solid #2a646d;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.invite-section::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(42, 73, 53, 0.05), transparent 60%);
  z-index: 0;
}

.invite-section:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.invite-section h4 {
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #588668;
  position: relative;
  z-index: 1;
}

.invite-form {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  position: relative;
  z-index: 1;
}

.email-input {
  flex: 1;
  min-width: 150px;
  padding: 10px 14px;
  border: 1px solid #b0c4b1;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border 0.3s ease, box-shadow 0.3s ease;
  background-color: #f8fdf9;
}

.email-input:focus {
  border-color: #2a4935;
  box-shadow: 0 0 0 3px rgba(42, 73, 53, 0.12);
}

.invite-button {
  background: linear-gradient(135deg, #9fccbd, #6eb3a3, #82b2a1);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.396);;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

.invite-button:hover {
  background: linear-gradient(135deg, #1f3627, #16271c);
  transform: scale(1.03);
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}

.summary-card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(68, 68, 68, 0.351);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.total-summary {
  font-size: 1.2rem;
  font-weight: bold;
  height: 100px;
}

.member-summary, .category-summary {
  margin-bottom: 15px;
}

.settings-section {
  background: linear-gradient(to right, #fdfffe, #ecf9f6, #def4f1);
  border: 1px solid #cfe2db;
  border-radius: 16px;
  padding: 30px 40px;
  max-width: 800px;
  margin: 40px auto;
  box-shadow: 0 2px 4px #93b9a9;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.settings-section:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(1, 83, 52, 0.232);
}


.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1f3b2c;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  font-size: 1.2rem;
  color: #3c6e58;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.setting-label {
  font-weight: 600;
  color: #2a4935;
  font-size: 1.05rem;
  letter-spacing: 0.4px;
  margin-bottom: 6px;
  transition: color 0.3s ease;
}

.input-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.setting-input {
  flex: 1;
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #c8d8d0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}


.setting-input:focus {
  border-color: #3c9d81;
  outline: none;
  box-shadow: 0 0 0 3px rgba(60, 157, 129, 0.15);
}
.save-button {
  padding: 10px 16px;
  background-image: linear-gradient(135deg, #3c9d81, #2e7c68);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-image 0.3s ease, transform 0.2s ease;
}

.save-button:hover:enabled {
  background-image: linear-gradient(135deg, #338b71, #246b5c);
  transform: translateY(-1px);
}

.save-button:disabled {
  background-image: none;
  background-color: #aaccc0;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  margin-top: 5px;
  color: #d32f2f;
  font-size: 0.85rem;
}

.danger-zone {
  padding: 20px;
  background-color: #fff5f5;
  border-left: 4px solid #d32f2f;
  border-radius: 10px;
  margin-top: 40px;
  box-shadow: 0 2px 6px rgba(65, 64, 64, 0.693);
}

.danger-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #d32f2f;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.danger-text {
  color: #444;
  font-size: 0.95rem;
  max-width: 70%;
}

.delete-button {
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-button:hover:enabled {
  background-color: #b71c1c;
}

.delete-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}


.modal-content1 {
  background-color: #f9fefc;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  margin: 100px auto;
  padding: 0;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-content2 {
  background-color: #f9fefc;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  margin: 100px auto;
  padding: 0;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  border-bottom: 3px solid #4f7a6b;
  background: linear-gradient(135deg, #b8f0db, #9fe3c9, #94dfd3);
  box-shadow: inset 0 -4px 6px rgba(0,0,0,0.1);
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.modal-header h3 {
  position: absolute;
  left: 50%;                      /* Center horizontally */
  transform: translateX(-50%);    /* Adjust back by 50% of its width */
  margin: 0;
  font-size: 1.6rem;
  text-align: center;
  text-shadow: 0px 2px 3px rgba(0, 0, 0, 0.352);
}

.modal-header .close-button {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #e4f9e4;
  transition: color 0.3s ease;
  padding: 5px;
  border-radius: 50%;
}

.modal-header .close-button:hover {
  color: #f9fefc;
  background: rgba(255, 255, 255, 0.15);
}

.modal-body {
  padding: 20px;
  background-color: #FBFFFC; 
}

.modal-overlay2 {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-header2 {
  position: relative;
  display: flex;
  padding: 15px 20px;
  justify-content: center;
  align-items: center;
  background-color: #f56161;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom: 1px solid #a40505;
  color: black;
}

.modal-header2 h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-button {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: black;
}

.modal-body2 {
  padding: 20px;
  background-color: #ffebee;
}

.note-textarea {
  width: 70%;
  margin-bottom: -3px;
  margin-left: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
  color: #2a646d;
}

.form-group input {
  width: 96%;
  padding: 8px;
  border: 1px solid #c0c0c0;
  border-radius: 4px;
}

.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

small {
    font-size: 11px;
    color: red;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

button.cancel-button{
  border: 1px solid #2e4e38;
}

.submit-button {
  background: linear-gradient(135deg, #9fccbd, #6eb3a3, #82b2a1);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.352);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.2s ease;
}

.submit-button:hover {
  background: linear-gradient(135deg, #4d8167, #2f5740);
  transform: scale(1.03);
}

.cancel-button {
  background: linear-gradient(to bottom, #5e5e5e, #3f3f3f); /* dark gray gradient */
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cancel-button:hover {
  background: linear-gradient(to bottom, #4a4a4a, #2f2f2f); /* slightly darker on hover */
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}


.confirmation-modal {
  text-align: center;
}

.confirmation-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.confirm-button {
  padding: 8px 15px;
  font-size: 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  color: #fff;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  background: linear-gradient(135deg, #e57373, #d32f2f, #b71c1c);
  box-shadow: 0 2px 5px rgba(211, 47, 47, 0.4);
}

.confirm-button:hover{
  background: linear-gradient(135deg, #d32f2f, #b71c1c, #7f0000);
  box-shadow: 0 4px 10px rgba(123, 0, 0, 0.6);
}
.no-expenses {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading-expenses {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.success-message {
  color: #2e7d32;
  margin-top: 10px;
}

@media (max-width: 1050px) {
  .expenses-section h3{
  padding: 25px 0px 25px 0px;
  width: 650px;
  }
}

@media (max-width: 860px) {
  .group-con {
    flex-wrap: wrap;
    flex-direction: column;
  }
  .budget-total-container{
    max-width: 100%;
  }
  .budget-form {
   width: 80%;
}
  .group-wrapper{
    width: 100%;
  }
  .member-item {
    display: flex;
    flex-wrap: wrap;
  }
  .member-actions {
    margin-top: 5px;
  }

  .contribution-form {
      max-width: 700px;
      margin-bottom: 0;
    }
    .photos-tab {
    max-height: 500px;
  }
  .invite-form {
    flex-wrap: wrap;
  }
  .floating-alert{
      width: 70%;
  }
  .danger-item {
    justify-content: center;
  }
  .danger-text {
    max-width: 100%;
  }
  .confirmation-modal {
    width: 80%;
  }
  .request-item {
    display: flex;
    flex-wrap: wrap;
  }
  .request-actions{
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;
    gap: 5px;
  }
}
</style>