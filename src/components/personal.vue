<template>
  <navigation/>
  <div class="main-layout smooth-scroll">
    <div v-if="showBudgetExceededAlert" class="budget-alert">
      <div class="alert-content">
        <span class="alert-icon">⚠️</span>
        <span>You have exceeded your monthly budget by {{ formatPHP(Math.abs(remainingBudget)) }}!</span>
        <button @click="dismissAlert" class="dismiss-btn">×</button>
      </div>
      </div>

      <div v-if="showDeleteConfirmation" class="floating-alert alert alert-warning" role="alert">
        <span class="alert-icon"><i class="fas fa-trash"></i></span>
        <span style="margin-left: 25px;">
    Are you sure you want to delete {{ expenseToDelete?.item_name }} ({{ formatPHP(expenseToDelete?.item_price) }})?
  </span>
      <button @click="confirmDeleteExpense" class="btn-cancel1">Yes</button>
      <button @click="cancelDeleteExpense" class="btn-confirm">No</button>
    </div>

    <div v-if="error" class="error-message">btn-cancel1
        An error occurred: {{ error }}
        <button @click="resetError">Try Again</button>
    </div>

      <div v-else>
    <div class="top-row"> 
  <div class="budget-container">
    <div class="budget-content">
    <div v-if="budgetSuccessMessage" class="budget-success-message" :class="{ hide: budgetHideMessage }">
      {{ budgetSuccessMessage }}
    </div>

    <div class="budget-display">
        <div class="budget-header">
          <h3>Budget for <br> {{ formatMonthYear(currentMonthYear) }}</h3>
          <button v-if="!hasExistingBudget" @click="showAddBudgetForm" class="btn-add">
            Add Budget
          </button>
          <button v-else @click="showEditBudgetForm" class="btn-edit">
            Edit Budget
          </button>
        </div>

    <div v-if="isBudgetLoading" class="loading">Loading budget...</div>

    <div v-else class="budget-details">
          <div class="month-selector">
            <button @click="prevMonth">&lt;</button>
            <span>{{ formatMonthYear(currentMonthYear) }}</span>
            <button @click="nextMonth">&gt;</button>
          </div>
          

  <div class="budget-amount">
    <span>BUDGET AMOUNT:</span>
    <strong class="amount-value">{{ formatPHP(currentMonthBudget.budget_amount) }}</strong>
  </div>

  <div class="expenses-summary">
  <div class="expenses-summary1">
          <div class="expenses-amount">
          <span>TOTAL EXPENSES:</span>
          <strong>{{ formatPHP(totalExpensesForMonth) }}</strong>
          </div>

          <div class="remaining-budget">
          <span>REMAINING BUDGET:</span>
          <strong :class="{ 'text-danger': remainingBudget < 0 }">
            {{ formatPHP(remainingBudget) }}
          </strong>
        </div>
        </div> 
        </div> 

          <div class="budget-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: budgetProgress + '%' }"
                :class="{ 'exceeded': budgetProgress >= 100 }"
              ></div>
            </div>
            <div class="progress-text">
              {{ budgetProgress.toFixed(1) }}% 
            </div>
          </div>
        </div>

        <!-- Budget Form Modal -->
        <div v-if="isAddingBudget || isEditingBudget" class="budget-form-modal">
          <div class="budget-form">
            <h3 class="form-title">{{ isEditingBudget ? 'EDIT' : 'ADD' }} BUDGET</h3>
            <div class="form-group1">
              <label>Month:</label>
              <input 
        v-if="isAddingBudget"
          type="text" 
          :value="formatMonthYear(currentMonthYear)" 
          class="form-input"
          disabled
        >
      <input 
        v-else
        type="text" 
          :value="formatMonthYear(currentMonthYear)" 
          class="form-input"
          disabled
        >
            </div>

            <div class="form-group1">
              <label>Budget Amount (₱):</label>
              <input 
                type="text" 
                v-model="budgetAmount" 
                placeholder="Enter budget amount"
                @input="formatCurrencyInput"
              required>
            </div>
            <div class="form-actions">
              <button @click="isEditingBudget ? updateBudget() : submitAddBudget()" class="btn-save">
                {{ isEditingBudget ? 'Update' : 'Save' }} Budget
              </button>
              <button @click="cancelBudgetForm" class="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>


  <!--ADDING EXPENSESSSS-->
    <div class="content-wrapper">
      <form @submit.prevent="handleSubmit" class="expense-form" ref="expenseForm"> 
         <input type="hidden" v-model="action" />
         <input type="hidden" v-if="editId" v-model="editId" />


         <div class="form-group">
          <h3> Add your Expenses</h3>
           <label>CATEGORY:</label>
           <div class="input-with-voice">
           <select v-model="expenseType" required @change="checkExpenseType">
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

<div v-if="expenseType === 'Other'" class="form-group">
  <label>CUSTOM CATEGORY:</label>
  <div class="input-with-voice">
    <input 
      type="text" 
      v-model="customExpenseType" 
      placeholder="Enter custom category" 
    />
    <button 
      @click="startVoiceInput('customType')" 
      class="voice-btn" 
      :class="{ active: isListening && voiceInputActiveField === 'customType' }"
      title="Set custom type by voice"
    >
      <i class="fas fa-microphone"></i>
    </button>
  </div>
</div>

 
  <div class="form-group">
  <label>ITEM NAME:</label>
  <div class="input-with-voice">
    <input type="text" v-model="itemName" @input="onItemNameChange" placeholder="Enter item name" required style="text-transform: uppercase;" />
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
  <label>ITEM PRICE:</label>
  <div class="input-with-voice">
    <input type="number" v-model.number="itemPrice" placeholder="Enter item price" required step="0.01" style="text-transform: uppercase"/>
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

         <button class="btn" type="submit"   :disabled="!hasBudgetForCurrentMonth">{{ editId ? 'Update Expense' : 'Add Expense' }}</button>
         <div v-if="!hasBudgetForCurrentMonth" class="no-budget-warning">
         <p>Please create a budget for {{ formatMonthYear(currentMonthYear) }} before adding expenses</p>
        </div>
         <div v-if="expenseSuccessMessage" class="expense-success-message" :class="{ hide: expenseHideMessage }">{{ expenseSuccessMessage }}</div>
      </form>

      </div>
      </div>

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
        </div>
      </div>
    </div>
    <div class="voice-help-footer">
      <button @click="showVoiceHelpModal = false" class="btn-ok">Got it!</button>
    </div>
  </div>
</div>

<button @click="showVoiceHelp()" class="voice-help-btn" title="Voice commands help">
  <i class="fas fa-question-circle"></i> Voice Help
</button>

<div class="expenses-container smooth-scroll" ref="expensesContainer">
  <!-- Tab Buttons -->
  <div class="expense-photo-tabs">
    <button 
      @click="activeView = 'expenses'" 
      :class="{ active: activeView === 'expenses' }"
      class="tab-btn"
    >
      <i class="fas fa-coins"></i> Expenses
    </button>
    <button 
      @click="activeView = 'photos'" 
      :class="{ active: activeView === 'photos' }"
      class="tab-btn"
    >
      <i class="fas fa-camera"></i> Photos
    </button>
  </div>

  <!-- Expenses View -->
  <div v-if="activeView === 'expenses'" class="expenses-view">
    <div class="expenses-section"> 
      <h3><i class="fas fa-coins"></i> <span>YOUR EXPENSES</span></h3> 
      <div class="expenses-table"> 
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Item Name</th>
              <th>Item Price</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in filteredExpenses" :key="expense?.id">
              <td>{{ (expense?.expense_type || 'N/A') .toUpperCase() }}</td>
              <td>{{ (expense?.item_name || 'N/A') .toUpperCase() }}</td>
              <td>{{ expense?.item_price ? formatPHP(expense.item_price) : '₱0.00' }}</td>
              <td>{{ formatDate(expense?.expense_date) }}</td>
              <td class="actions">
                <button @click="editExpense(expense)" class="edit-btn">Edit</button>
                <button @click="deleteExpenseHandler(expense)" class="delete-btn">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="total">
      Total: <strong>₱{{ totalAmount.toFixed(2) }}</strong> (≈ {{ formatUsd(convertPhpToUsd(totalAmount)) }} USD)
    </div>
  </div>

  <!-- Photos View -->
  <div v-if="activeView === 'photos'" class="photos-tab">
    <div class="photos-header">
  <div class="photos-title">
    <h2><i class="fas fa-images"></i> Photos</h2>
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
    <p>No photos uploaded yet.</p>
  </div>

  <div v-else class="photos-grid">
    <div v-for="photo in groupPhotos" :key="photo.id" class="photo-card">
      <div class="photo-wrapper">
        <img :src="photo.image_url" :alt="photo.description || 'Group photo'" @click="openPhotoModal(photo)" class="photo-thumbnail" @error="handleImageError">
        <div class="photo-actions">
          <button @click.stop="startEditPhoto(photo)" class="edit-photo-btn" v-if="canDeletePhoto(photo)">
        <i class="fas fa-edit"></i>
      </button>
          <button @click.stop="confirmDeletePhoto(photo)" class="delete-photo-btn" v-if="canDeletePhoto(photo)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="photo-meta">
        <p class="photo-description">{{ photo.description || 'No description' }}</p>
        <div class="photo-footer">
          <span class="photo-date">
            <i class="far fa-calendar-alt"></i> {{ formatDate(photo.created_at) }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showUploadModal" class="modal-overlay5">
  <div class="modal-content5 photo-upload-modal">
    <div class="modal-header5">
      <h3>{{ uploadSuccess ? 'Upload Complete' : 'Upload Photo' }}</h3>
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
          <button type="button" @click="closePhotoModal" class="cancel-button1">Cancel</button>
          <button type="submit" class="submit-button1" :disabled="uploadingPhoto">
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

<div v-if="editingPhoto" class="modal-overlay7">
  <div class="modal-content7 photo-edit-modal">
    <div class="modal-header7">
      <h3>{{ updateSuccess ? 'Update Complete' : 'Edit Photo' }}</h3>
      <button @click="cancelEditPhoto" class="close-button7">&times;</button>
    </div>
    <div class="modal-body7">
      <form @submit.prevent="updatePhoto" v-if="!updateSuccess">
        <div class="form-group7">
          <label>Photo Description</label>
          <textarea v-model="editPhotoDescription" placeholder="Update description"></textarea>
        </div>
        
        <div class="form-group7">
          <label>Replace Photo (optional)</label>
          <input 
            type="file" 
            @change="handleEditFileSelect"
            accept="image/*"
          >
          <div class="photo-preview7">
            <img :src="editPhotoPreview" alt="Preview">
          </div>
        </div>
        
        <div class="form-actions7">
          <button type="button" @click="cancelEditPhoto" class="cancel-button1">Cancel</button>
          <button type="submit" class="submit-button1" :disabled="updatingPhoto">
            <span v-if="updatingPhoto">
              <i class="fas fa-spinner fa-spin"></i> Updating...
            </span>
            <span v-else>Update Photo</span>
          </button>
        </div>
      </form>

      <!-- Success message section -->
      <div v-if="updateSuccess" class="update-success-message">
        <i class="fas fa-check-circle success-icon"></i>
        <p>Photo updated successfully!</p>
        <button @click="cancelEditPhoto" class="ok-button">OK</button>
      </div>
    </div>
  </div>
</div>

<div v-if="showConfirmationModal" class="modal-overlay2">
      <div class="modal-content2 confirmation-modal">
        <div class="modal-header2">
          <h3>{{ confirmationTitle }}</h3>
          <button @click="closeModal" class="close-button2">&times;</button>
        </div>
        <div class="modal-body2">
          <p>{{ confirmationMessage }}</p>
          <div class="confirmation-actions">
            <button @click="closeModal" class="cancel-button">Cancel</button>
            <button @click="confirmAction" class="confirm-button">Confirm</button>
          </div>
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
</div>
</div>
</div>
</div>
 </template>
 
 <script>
 import Navigation from "./navigation.vue";
 import { mapState, mapGetters, mapActions } from 'vuex'
 
 export default {
   name: 'Personal',
   components: { Navigation },
   data() {
     return {
      updateSuccess: false,
    updatingPhoto: false,
      editingPhoto: null,
    editPhotoDescription: '',
    editPhotoFile: null,
    editPhotoPreview: null,
    isEditingPhoto: false,
      zoomLevel: 1,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    translate: { x: 0, y: 0 },
    lastPosition: { x: 0, y: 0 },
      uploadSuccess: false,
      showConfirmationModal: false,
    confirmationTitle: '',
    confirmationMessage: '',
    confirmAction: null,
      photoModal: {
      show: false,
      photo: { description: '', file: null },
      preview: null,
      uploading: false
    },
      isAdmin: false,
      activeView: 'expenses', 
      photoFile: null,
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
      showVoiceHelpModal: false,
      isListening: false,
      voiceInput: '',
      voiceCommands: [],
      recognition: null,
      voiceInputActiveField: null,
       expenseType: '',
       customExpenseType: '',
       itemName: '',
       itemPrice: '',
       editId: null,
       action: 'add',
       hideMessage: false,
       successTimeout: null,
       budgetAmount: '',
       budgetEditId: null, 
       isAddingBudget: false,
       isEditingBudget: false,
       messageContext: '',
       budgetSuccessMessage: '',
       budgetHideMessage: false,
       budgetSuccessTimeout: null,
       expenseSuccessMessage: '',
       expenseHideMessage: false,
       expenseSuccessTimeout: null,
       filterMonth: null,
       error: null,
       selectedBudget: null,
       newBudgetMonthYear: this.getCurrentMonthYear(),
       isBudgetLoading: false,
       currentMonthYear: this.getCurrentMonthYear(),
       showBudgetExceededAlert: false,
       alertDismissed: false,
       dismissedAlerts: {},
       showDeleteConfirmation: false,
       expenseToDelete: null,
       lastCheckedMonthYear: null,
       isPredicting: false,
       showPredictionFeedback: false,
       predictionDebounce: null,
       exchangeRateError: null,
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
    ...mapState(['addExpenses', 'personalBudgets', 'usdExchangeRate']),
  ...mapGetters(['getTotalAmount', 'getCurrentBudget', 'getAvailableMonths', 'getAddExpenseMonthYear']),
  
  zoomStyle() {
    return {
      transform: `scale(${this.zoomLevel}) translate(${this.translate.x}px, ${this.translate.y}px)`,
      cursor: this.zoomLevel > 1 ? 'grab' : 'default'
    };
  },

  hasBudgetForCurrentMonth() {
    return this.currentMonthBudget?.budget_amount > 0;
  },

  safeExchangeRate() {
    return this.usdExchangeRate || 0.018045;
  },

  currentMonthExpenses() {
    return this.filteredExpenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date);
      const selectedDate = new Date(this.currentMonthYear);
      return (
        expenseDate.getFullYear() === selectedDate.getFullYear() &&
        expenseDate.getMonth() === selectedDate.getMonth()
      );
    });
  },
  
  currentMonthBudget() {
    return this.$store.getters.getCurrentBudget(this.currentMonthYear) || {
      month_year: this.currentMonthYear,
      budget_amount: 0
    };
  },
  
  totalExpensesForMonth() {
    return this.filteredExpenses.reduce((sum, expense) => {
      return sum + (Number(expense.item_price) || 0);
    }, 0);
  },
  
  remainingBudget() {
    const budgetAmount = this.currentMonthBudget?.budget_amount || 0;
    const totalExpenses = this.totalExpensesForMonth;
    return budgetAmount - totalExpenses; 
  },

  currentBudgetDisplay() {
    if (this.selectedBudget) {
      return this.formatPHP(this.selectedBudget.budget_amount);
    }
    return this.formatPHP(0);
  },

  budgetProgress() {
    if (this.currentMonthBudget.budget_amount <= 0) return 0;
    const progress = (this.totalExpensesForMonth / this.currentMonthBudget.budget_amount) * 100;
    return Math.min(progress, 100); 
  },

  shouldShowExpenses() {
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return this.selectedMonthYear === currentMonthYear;
  },

  filteredExpenses() {
  const currentBudget = this.currentMonthBudget;
  if (!currentBudget?.id) return [];
  
  return this.addExpenses.filter(expense => {
    return expense.personal_budget_id === currentBudget.id;
    
  });
},

  selectedMonthYear: {
  get() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  },
  set(value) {

    console.log("Month selection is locked in Add Expense page");
  }
},

currentBudget() {
  const currentMonthYear = this.getCurrentMonthYear();
  return this.$store.getters.getCurrentBudget(currentMonthYear);
},

     safeSelectedMonthYear() {
      return this.selectedMonthYear || this.currentMonthYear;
    },
 
    totalAmount() {
    return this.filteredExpenses.reduce((sum, expense) => {
      return sum + (Number(expense?.item_price) || 0);
    }, 0);
  },
 
     totalInUsd() {
      return this.convertPhpToUsd(this.totalAmount);
     },
 
     currentBudgetAmount() {
    return this.currentBudget.budget_amount;
  },
     
  hasExistingBudget() {
    return !!(this.selectedBudget && this.selectedBudget.id);
  },

  isBudgetExceeded() {
    if (!this.currentBudget?.budget_amount) return false;
    return this.totalAmount > this.currentBudget.budget_amount;
  }
},

   async mounted() {
  try {
    this.isLoading = true;
    const savedDismissedAlerts = localStorage.getItem('dismissedAlerts');
    if (savedDismissedAlerts) {
      this.dismissedAlerts = savedDismissedAlerts ? JSON.parse(savedDismissedAlerts) : {};
    }
    
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    await this.setSelectedMonthYear(currentMonthYear);

    this.setupVoiceRecognition();
    this.fetchPhotos();
    
    await Promise.all([
      this.fetchExchangeRate(),
      this.fetchPersonalBudgets(),
      this.fetchAddExpenses(),
      this.loadBudgetForMonth(currentMonthYear)
    ]);
    
    this.checkBudgetStatus();
    
    if (this.editId) {
      this.$nextTick(() => {
        const formElement = this.$refs.expenseForm;
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
    
  } catch (error) {
    console.error("Initialization error:", error);
    this.error = error.message || 'Failed to load data';
  } finally {
    this.isLoading = false;
  }
},

beforeUnmount() {
  clearInterval(this.monthCheckInterval);
  if (this.photoPreview) {
    URL.revokeObjectURL(this.photoPreview);
  }
},


  watch: {
  filteredExpenses: {
    deep: true,
    handler() {
      this.checkBudgetStatus();
    }
  },

  currentMonthBudget: {
    deep: true,
    handler() {
      this.checkBudgetStatus();
    }
  },
  
  currentMonthYear: {
    immediate: true,
    handler(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.checkBudgetStatus(true);
      }
    }
  }
  },

   methods: {
     ...mapActions([
       'fetchExchangeRate',
       'fetchExpenses',
       'fetchPersonalBudgets',
       'addExpense',
       'updateExpense',
       'deleteExpense',
       'addBudget',
       'updateBudget',
       'setSelectedMonthYear' ,
       'fetchAddExpenses' 
     ]),

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
  const incorrectUrl = event.target.src;
  console.error('Image failed to load:', incorrectUrl);
  
  // Check if the URL needs to be fixed
  if (incorrectUrl.includes('localhost:5173')) {
    // Try to reconstruct the correct URL
    try {
      // Extract just the path part
      const urlObj = new URL(incorrectUrl);
      const path = urlObj.pathname;
      
      // Create new URL using backend base URL
      const backendBase = this.$axios.defaults.baseURL;
      const correctUrl = backendBase + path;
      
      // Try loading with the corrected URL
      event.target.src = correctUrl;
      return;
    } catch (e) {
      console.error('Error reconstructing URL:', e);
    }
  }
  
  // Fallback - hide the broken image
  event.target.style.display = 'none';
  event.target.parentElement?.classList?.add('broken-image');
},

     showVoiceHelp() {
    this.showVoiceHelpModal = true;
  },

     prevMonth() {
    const date = new Date(this.currentMonthYear);
    date.setMonth(date.getMonth() - 1);
    const now = new Date();
    const newMonthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const newDate = new Date(newMonthYear);
  
  if (newDate.getFullYear() < now.getFullYear() || 
      (newDate.getFullYear() === now.getFullYear() && newDate.getMonth() < now.getMonth())) {

    this.showBudgetSuccessMessage('Cannot navigate to past months');
    return;
  }
  
  this.changeMonth(date);
},

  nextMonth() {
    const date = new Date(this.currentMonthYear);
    date.setMonth(date.getMonth() + 1);
    this.changeMonth(date);
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
      }
      this.stopVoiceInput(); // Auto-stop after field input
      return;
    }

 this.handleGeneralCommands(transcript);
  },

  handleCategoryInput(transcript) {
    const category = this.matchCategory(transcript);
    this.expenseType = category;
    this.$toast.success(`Category set to: ${category}`);
  },

  handleCustomTypeInput(transcript) {
  this.customExpenseType = transcript;
  this.$toast.success(`Custom type set to: ${transcript}`);
},

  handleItemInput(transcript) {
    this.itemName = transcript;
    this.$toast.success(`Item set to: ${transcript}`);
  },

  handleAmountInput(transcript) {
    const amount = this.extractNumber(transcript);
    if (amount !== null) {
      this.itemPrice = amount;
      this.$toast.success(`Amount set to: ${this.formatPHP(amount)}`);
    } else {
      this.$toast.error("Couldn't understand the amount. Please try again.");
    }
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
  const categories = ['Food', 'Bill', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Other'];
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
  
  if (['health', 'doctor', 'hospital', 'pharmacy', 'medicine', 'drug', 'insurance', 'dental', 'optical', 'checkup', 'clinic'].some(term => lowerSpoken.includes(term))) {
    return 'Healthcare';
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
    this.expenseType = matchedCategory;
    this.$toast.success(`Category set to: ${matchedCategory}`);
  },

  setItemNameFromVoice(itemName) {
    this.itemName = itemName;
    this.$toast.success(`Item name set to: ${itemName}`);
  },

  setAmountFromVoice(amount) {
    const numericAmount = this.extractNumber(amount);
    if (numericAmount) {
      this.itemPrice = numericAmount;
      this.$toast.success(`Amount set to: ${this.formatPHP(numericAmount)}`);
    } else {
      this.$toast.error("Couldn't understand the amount");
    }
  },

  startEditPhoto(photo) {
    this.editingPhoto = { ...photo };
    this.editPhotoDescription = photo.description || '';
    this.editPhotoPreview = photo.image_url;
    this.isEditingPhoto = true;
  },

  handleEditFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        this.$toast.error('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        this.$toast.error('Image size should be less than 5MB');
        return;
      }
      
      this.editPhotoFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.editPhotoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  },

  async updatePhoto() {
  if (!this.editingPhoto) return;

  try {
    const formData = new FormData();
    formData.append('description', this.editPhotoDescription);
    if (this.editPhotoFile) {
      formData.append('photo', this.editPhotoFile);
    }

    const response = await this.$axios.put(
      `/api/photos/${this.editingPhoto.id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );

    if (response.data && response.data.success === 1) {
      // Update the photo in the list with complete URL
      const updatedPhoto = response.data.photo;
      if (!updatedPhoto.image_url.startsWith('http')) {
        updatedPhoto.image_url = `${this.$axios.defaults.baseURL}${updatedPhoto.image_url}`;
      }

      const index = this.groupPhotos.findIndex(p => p.id === this.editingPhoto.id);
      if (index !== -1) {
        this.groupPhotos[index] = {
          ...this.groupPhotos[index],
          description: updatedPhoto.description,
          image_url: updatedPhoto.image_url,
          created_at: updatedPhoto.created_at
        };
      }

      this.updateSuccess = true;
    } else {
      throw new Error(response.data?.message || 'Update failed');
    }
  } catch (error) {
    console.error('Update error:', error);
    this.$toast.error(error.response?.data?.message || error.message || 'Failed to update photo');
  } finally {
    this.updatingPhoto = false;
  }
},

cancelEditPhoto() {
  this.editingPhoto = null;
  this.editPhotoDescription = '';
  this.editPhotoFile = null;
  this.editPhotoPreview = null;
  this.updateSuccess = false;
  this.isEditingPhoto = false;
},

async fetchPhotos() {
  this.photosLoading = true;
  this.photosError = null;
  try {
    const response = await this.$axios.get(
      `/api/photos`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );
    
    if (response.data && response.data.success === 1) {
      this.groupPhotos = response.data.photos.map(photo => {
        // Ensure image_url is complete
        let imageUrl = photo.image_url;
        if (!imageUrl.startsWith('http')) {
          imageUrl = `${this.$axios.defaults.baseURL}${imageUrl}`;
        }
        
        return {
          ...photo,
          image_url: imageUrl,
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
      this.$toast.error('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.$toast.error('Image size should be less than 5MB');
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
    this.$toast.error('Please select a photo to upload');
    return;
  }
  
  this.uploadingPhoto = true;

  try {
    const formData = new FormData();
    formData.append('photo', this.newPhoto.file);
    formData.append('description', this.newPhoto.description);
    
    const response = await this.$axios.post(
      `/api/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
        }
      }
    );

    if (response.data && response.data.success === 1) {
      const user = JSON.parse(localStorage.getItem('user'));
      const photo = {
        id: response.data.photo.id,
        image_url: response.data.photo.image_url,
        description: response.data.photo.description,
        user_id: user.id,
        created_at: new Date().toISOString()
      };

      this.groupPhotos.unshift(photo);
      this.uploadSuccess = true; 
      this.$nextTick(() => {
        this.showUploadModal = false;
      });
    } else {
      throw new Error(response.data?.message || 'Upload failed');
    }
  } catch (err) {
    console.error('Upload error:', err);
    this.$toast.error(err.response?.data?.message || err.message || 'Failed to upload photo');
  } finally {
    this.uploadingPhoto = false;
  }
},

resetPhotoForm() {
  this.newPhoto = { description: '', file: null };
  this.photoPreview = null;
  if (this.$refs.photoInput) {
    this.$refs.photoInput.value = '';
  }
  this.showUploadModal = false; // Explicitly close the modal
},

openPhotoModal(photo) {
    this.viewingPhoto = photo;
  },
  
  closePhotoModal() {
  this.showUploadModal = false;
  this.uploadSuccess = false;
  this.newPhoto = { description: '', file: null };
  this.photoPreview = null;
  if (this.$refs.photoInput) {
    this.$refs.photoInput.value = '';
  }
},

confirmDeletePhoto(photo) {
  if (!this.canDeletePhoto(photo)) {
    this.$toast.error("You don't have permission to delete this photo");
    return;
  }
  
  this.confirmationTitle = 'Delete Photo';
  this.confirmationMessage = 'Are you sure you want to delete this photo?';
  this.confirmAction = async () => {
    try {
      const response = await this.deletePhoto(photo.id);
      
      // Check for success in the response
      if (response && response.success) {
        this.$toast.success(response.message || 'Photo deleted successfully!');
        this.groupPhotos = this.groupPhotos.filter(p => p.id !== photo.id);
      } else {
        throw new Error(response?.message || 'Photo deletion failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      this.$toast.error(err.response?.data?.message || err.message || 'Failed to delete photo');
    } finally {
      this.showConfirmationModal = false;
    }
  };
  this.showConfirmationModal = true;
},

  closeModal() {
    this.showConfirmationModal = false;
    this.confirmAction = null;
  },

  beforeDestroy() {
  if (this.photoPreview) {
    URL.revokeObjectURL(this.photoPreview);
  }
  this.showUploadModal = false; 
},
    
async deletePhoto(photoId) {
  try {
    const response = await this.$axios.delete(`/api/photos/${photoId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
      }
    });
        
    if (response && response.data && response.data.success) {
      this.groupPhotos = this.groupPhotos.filter(p => p.id !== photoId);
      return response.data; // Return the successful response
    }
    
    // If response structure is unexpected
    throw new Error(response?.data?.message || 'Unexpected response from server');
    
  } catch (err) {
    console.error('Error deleting photo:', err);
    throw err; // Re-throw the error to be caught by the calling function
  }
},

  canDeletePhoto(photo) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !photo) return false;
  return user.id === photo.user_id;
},


  async changeMonth(date) {
    const newMonthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  this.currentMonthYear = newMonthYear;

  await Promise.all([
    this.$store.dispatch('fetchAddExpenses'),
    this.loadBudgetForMonth(newMonthYear)
  ]);
  
  this.checkBudgetStatus(true);

  this.dismissedAlerts[newMonthYear] = false;
  localStorage.setItem('dismissedAlerts', JSON.stringify(this.dismissedAlerts));
},

    checkMonthChange() {
    const lastAccessedMonth = localStorage.getItem('lastAccessedMonth');
    const currentMonth = new Date().getMonth();
    
    if (lastAccessedMonth && parseInt(lastAccessedMonth) !== currentMonth) {
        console.log('New month detected - resetting view');
        localStorage.removeItem('budgetAlertDismissed');
        this.alertDismissed = false;

        const newMonthYear = this.getCurrentMonthYear();
        this.setSelectedMonthYear(newMonthYear);
        
        Promise.all([
      this.fetchAddExpenses(), 
      this.fetchPersonalBudgets()
    ]).then(() => {
      this.checkBudgetStatus();
    });
  }
      
      localStorage.setItem('lastAccessedMonth', currentMonth);
    },

     onItemNameChange() {
      clearTimeout(this.predictionDebounce);
      
      // Only predict if item name has at least 3 characters and no category is selected
      if (this.itemName.length < 3 || this.expenseType) return;
      
      this.predictionDebounce = setTimeout(() => {
        this.predictCategory();
      }, 500); // Debounce to avoid too many requests
    },
    
    async handleLearningData(expenseData) { 
  try {
    // Skip if missing required fields
    if (!expenseData.item_name?.trim() || !expenseData.expense_type) {
      console.log('Skipping learning - missing required fields');
      return { success: false, reason: 'Missing required fields' };
    }

    const payload = {
      item_name: expenseData.item_name.trim(),
      expense_type: expenseData.expense_type,
      item_price: expenseData.item_price ? Number(expenseData.item_price) : null,
      personal_budget_id: expenseData.personal_budget_id || null,
      userId: this.$store.state.user?.id || null
    };

    console.log('Attempting to send learning data:', payload);
      
    const response = await this.$axios.post('/api/predictions/learn', payload, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('jsontoken')}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Learning response:', response.data);
    return { success: true, data: response.data };

  } catch (error) {
    const errorDetails = {
      message: error.message,
      response: error.response?.data,
      config: error.config
    };
    
    console.error('Learning failed (non-critical):', errorDetails);
    
    // Return error details but don't throw - learning failure shouldn't block UI
    return { 
      success: false, 
      error: errorDetails,
      isCritical: false 
    };
  }
},

async predictCategory() {
  if (this.isPredicting || !this.itemName || this.itemName.length < 3) return;
  
  try {
    this.isPredicting = true;
    
    const response = await this.$axios.post('/api/predictions/predict', {
      item_name: this.itemName.trim() // Add trim() to clean input
    }, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('jsontoken')}`,
        'Content-Type': 'application/json' // Explicit content type
      }
    });
    
    if (response.data.success) {
      const predictedCategory = response.data.data.expense_type;
      const confidence = response.data.data.confidence;
    //  this.expenseType = predictedCategory;
      
    this.showPredictionFeedback = (confidence < 0.7) || (predictedCategory === 'Other');
      this.expenseType = predictedCategory;
    }
  } catch (error) {
    console.error('Prediction failed:', error);
    this.$toast.error("Prediction service unavailable. Please try later.");
  } finally {
    this.isPredicting = false;
  }
},

shouldSuggestAlternative(itemName) {
  const lowerItem = itemName.toLowerCase();
  const words = lowerItem.split(/\s+/);
  
  const categoryKeywords = {
        Food: [
          "burger", "burgei", "burgir", "hamburger", "jollibee", 
          "pizza", "piza", "pasta", "sandwich", "fries", "milktea",
          "rice", "noodles", "chicken", "mcdo", "kfc"
        ],
        Bill: [
          "electric bill", "water bill", "internet bill", "phone bill",
          "cable bill", "utility bill", "rent", "mortgage", "electricity",
          "water payment", "internet payment"
        ],
        Transportation: [
          "gasoline", "gas", "petrol", "diesel", "jeepney fare",
          "bus", "mrt", "grab", "angkas", "taxi",
          "lrt fare", "tricycle fare", "parking fee", "car maintenance"
        ],
        Entertainment: [
          "movie tickets", "netflix", "spotify", "youtube premium",
          "concert tickets", "videoke", "arcade", "theme park",
          "movie", "cinema", "streaming", "game", "video game"
        ],
        Healthcare: [
          "doctor visit", "hospital", "medicine", "vitamins",
          "checkup", "dentist", "vaccine", "medical supplies",
          "pharmacy", "drugstore", "clinic", "xray", "laboratory"
        ],
        Shopping: [
          'shoes', 'clothes', 'shirt', 'pants', 'dress',
          'gadget', 'phone', 'laptop', 'accessories', 'bag',
          'watch', 'perfume', 'makeup', 'groceries', 'market',
          'office chair', 'desk', 'monitor', 'keyboard', 'mouse',
          'furniture', 'stationery', 'notebook', 'pen', 'backpack'
        ]
      };
  const isUnknown = !Object.values(categoryKeywords).some(keywords => 
    keywords.some(keyword =>
      keyword.includes(' ') ? 
        lowerItem.includes(keyword) : 
        words.includes(keyword)
    )
  );

  return isUnknown;
},

async submitPredictionFeedback(isCorrect) {
  try {
    const payload = {
      item_name: this.itemName.trim(),
      expense_type: isCorrect ? this.expenseType : 'Other', // Use correct type or 'Other'
      correction_source: isCorrect ? 'manual' : 'auto',
      userId: this.$store.state.user?.id, // Match your column name (userId not user_id)
    };

    // For both correct and incorrect cases
    await this.$axios.post('/api/predictions/learn', payload, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
      }
    });

    if (isCorrect) {
      this.$toast.success("Category confirmed!");
    } else {
      this.expenseType = '';
      this.$toast.info("Prediction rejected. Will learn from this.");
    }

    this.showPredictionFeedback = false;
  } catch (error) {
    console.error('Feedback error:', error);
    this.$toast.error("Feedback submission failed");
  }
},

  dismissAlert() {
    this.showBudgetExceededAlert = false;
    this.dismissedAlerts = {
    ...this.dismissedAlerts,
    [this.currentMonthYear]: true
  };
  localStorage.setItem('dismissedAlerts', JSON.stringify(this.dismissedAlerts));
},

  checkBudgetStatus(forceShow = false) {
    const budget = this.currentMonthBudget;

  if (!budget?.budget_amount || budget.budget_amount <= 0) {
    this.showBudgetExceededAlert = false;
    return;
  }
  
  const expensesForSelectedMonth = this.filteredExpenses.reduce((sum, expense) => {
    return sum + (Number(expense.item_price) || 0);
  }, 0);

  const isExceeded = expensesForSelectedMonth > budget.budget_amount;
  const isDismissed = this.dismissedAlerts[this.currentMonthYear] || false;

  this.showBudgetExceededAlert = isExceeded && (forceShow || !isDismissed);
},
  
     getCurrentMonthYear() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    },
 
     handleMonthYearChange(newMonthYear) {
       this.setSelectedMonthYear(newMonthYear);  
       this.fetchExpenses();
     },
 
     formatMonthYear(monthYear) {
       try {
         if (!monthYear) {
           const now = new Date();
           return now.toLocaleString('default', { month: 'long', year: 'numeric' });
         }
         
         if (typeof monthYear === 'string') {
           const [year, month] = monthYear.split('-').map(Number);
           if (!isNaN(year) && !isNaN(month)) {
             const date = new Date(year, month - 1);
             return date.toLocaleString('default', { 
               month: 'long', 
               year: 'numeric' 
             });
           }
         }
         
         // Fallback for invalid input
         const now = new Date();
         return now.toLocaleString('default', { month: 'long', year: 'numeric' });
       } catch (e) {
         console.error('Error formatting month/year:', e);
         return 'Invalid date';
       }
     },
 
     // Budget Form Methods - REPLACED submitBudget with these two methods
     showAddBudgetForm() {
    this.isAddingBudget = true;
    this.isEditingBudget = false;
    this.budgetAmount = '';
    this.newBudgetMonthYear = this.currentMonthYear;
  },

     
     showEditBudgetForm() {
      this.isEditingBudget = true;
      this.isAddingBudget = false;
      this.budgetAmount = this.selectedBudget.budget_amount;
     },
     
     cancelBudgetForm() {
       this.isAddingBudget = false;
       this.isEditingBudget = false;
     },
 
     async loadBudgetForMonth(monthYear) {
    this.isBudgetLoading = true;
    try {
      const budget = await this.$store.dispatch('fetchBudgetForMonth', monthYear);
     
      this.selectedBudget = budget && budget.id ? budget : {
      month_year: monthYear,
      budget_amount: 0
    };
    
  } catch (error) {
    console.error('Error loading budget:', error);
    this.selectedBudget = {
      month_year: monthYear,
      budget_amount: 0
    };
  } finally {
    this.isBudgetLoading = false;
  }
},
     async submitAddBudget() {
    try {
      if (!this.budgetAmount) {
        throw new Error('Please enter a budget amount');
      }

      const monthYear = this.isAddingBudget ? 
        this.newBudgetMonthYear : 
        this.currentMonthYear;

      const budgetData = {
        month_year: monthYear,
        budget_amount: this.parseCurrency(this.budgetAmount)
      };
      
      const result = await this.addBudget(budgetData); 
      
      if (result.success) {
        this.showBudgetSuccessMessage(result.message || 'Budget added successfully!');
        await this.fetchPersonalBudgets();

        if (this.isAddingBudget && monthYear !== this.currentMonthYear) {
          this.currentMonthYear = monthYear;
          await this.loadBudgetForMonth(monthYear);
        }

        this.cancelBudgetForm();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Budget add error:', error);
      this.showBudgetSuccessMessage(error.message || 'Failed to add budget');
    }
  },
 
     async updateBudget() {
      try {
      if (!this.selectedBudget?.id) {
        throw new Error('No budget found for current month');
      }

      if (!this.budgetAmount) {
        throw new Error('Please enter a budget amount');
      }
 
      const budgetData = {
        id: this.selectedBudget.id,
        month_year: this.currentMonthYear,
        budget_amount: this.parseCurrency(this.budgetAmount)
      };
         
         const result = await this.$store.dispatch('updateBudget', budgetData);
         
         if (result.success) {
           this.showBudgetSuccessMessage(result.message || 'Budget updated successfully!');
           await this.loadBudgetForMonth(this.currentMonthYear);
           await this.fetchPersonalBudgets();
           this.cancelBudgetForm();
         } else {
           throw new Error(result.message);
         }
       } catch (error) {
         this.showBudgetSuccessMessage(error.message || 'Failed to update budget');
       }
     },
 
     parseCurrency(value) {
       if (!value) return 0;
       const numericValue = String(value).replace(/[^\d.]/g, '');
       return parseFloat(numericValue) || 0;
     },
     
     convertPhpToUsd(phpAmount) {
      const rate = this.safeExchangeRate;
      const usdAmount = parseFloat(phpAmount) * rate;
      return parseFloat(usdAmount.toFixed(6)); 
    },
     
     formatUsd(value) {
       return '$' + parseFloat(value).toFixed(2);
     },
     
     formatPHP(value) {
  try {
    const numericValue = typeof value === 'string' ? this.parseCurrency(value) : value;
    const amount = Number(numericValue) || 0;
    
    return amount.toLocaleString('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).replace('₱', '₱'); 
  } catch (e) {
    console.error('Error formatting PHP:', e);
    return '₱0.00'; // Fallback value
  }
},

     
     formatDate(dateString) {
       if (!dateString || dateString === 'N/A') return 'N/A';
       
       try {
         const options = { 
           day: 'numeric',   
           month: 'short',   
           year: 'numeric'    
         };
         return new Date(dateString).toLocaleDateString('en-US', options);
       } catch (e) {
         console.error('Date formatting error:', e);
         return 'N/A';
       }
     },
 
     // Expense Methods
     async handleSubmit() {
  try {
    if (!this.hasBudgetForCurrentMonth) {
      this.showExpenseSuccessMessage('Please create a budget for this month before adding expenses');
      return;
    }

    if (!this.validateExpenseForm()) return;

    const currentMonthYear = this.currentMonthYear;
    let budget = await this.$store.dispatch('fetchBudgetForMonth', currentMonthYear);

    if (!budget?.id) {
      budget = await this.$store.dispatch('addBudget', {
        month_year: currentMonthYear,
        budget_amount: 0
      });
    }

    const expenseData = {
  item_price: Number(this.itemPrice),
  expense_type: this.expenseType === 'Other' ? this.customExpenseType : this.expenseType,
  item_name: this.itemName,
  personal_budget_id: budget.id,
};

    console.log('Submitting expense:', expenseData);
    
    let result;
    if (this.editId) {
      result = await this.updateExpense({
        id: this.editId,
        expenseData: expenseData
      });
    } else {
      result = await this.addExpense(expenseData);
      
      if (result.success) {
        await this.handleLearningData({
          item_name: expenseData.item_name,
          expense_type: expenseData.expense_type,
          item_price: expenseData.item_price,
          personal_budget_id: expenseData.personal_budget_id,
         // custom_type: expenseData.custom_type
        });
      }
    }

    if (result.success) {
      console.log('Expense added successfully:', result.data);
      
      // Refresh data
      await Promise.all([
        this.fetchAddExpenses(),
        this.fetchPersonalBudgets()
      ]);
      
      this.checkBudgetStatus(true);
      
      this.showExpenseSuccessMessage(this.editId ? 'Expense updated!' : 'Expense added!');
      this.resetForm();
      
      this.$nextTick(() => {
        const target = this.editId ? this.$refs.expenseForm : this.$refs.expensesContainer;
        target?.scrollIntoView({ behavior: 'smooth' });
      });
    } else {
      console.error('Failed to add expense:', result.message);
      this.showExpenseSuccessMessage(result.message || 'Failed to add expense');
    }
  } catch (error) {
    console.error('Submit error:', error);
    this.showExpenseSuccessMessage(error.message || 'Failed to save expense');
  }
},

validateExpenseForm() {
    if (!this.itemPrice || isNaN(Number(this.itemPrice)) || Number(this.itemPrice) <= 0) {
    this.showExpenseSuccessMessage('Please enter a valid positive amount');
    return false;
  }

  if (!this.itemPrice || isNaN(Number(this.itemPrice))) {
    this.showExpenseSuccessMessage('Please enter a valid amount');
    return false;
  }

  if (!this.expenseType) {
    this.showExpenseSuccessMessage('Please select an expense type');
    return false;
  }

  if (!this.itemName?.trim()) {
    this.showExpenseSuccessMessage('Please enter an item name');
    return false;
  }

  if (!this.currentBudget?.id) {
    this.showExpenseSuccessMessage('No valid budget selected');
    return false;
  }

  return true;
},
 
editExpense(expense) {
  if (!expense?.id) {
    console.error('Cannot edit - invalid expense:', expense);
    this.showExpenseSuccessMessage('Cannot edit this expense');
    return;
  }
  
  this.editId = expense.id;
  this.expenseType = expense.expense_type || '';
  this.customExpenseType = this.expenseType === 'Other' ? expense.expense_type : '';
  this.itemName = expense.item_name || '';
  this.itemPrice = expense.item_price || '';
  this.action = 'edit'; // Make sure this is set

  this.$nextTick(() => {
    this.$refs.expenseForm.scrollIntoView({ behavior: 'smooth' });
  });
},
 
async deleteExpenseHandler(expense) {
  this.showDeleteConfirmation = true;
  this.expenseToDelete = expense; // Store the entire expense object
},

  confirmDeleteExpense() {
    const id = this.expenseToDelete?.id;
  if (!id) {
    this.showExpenseSuccessMessage('No expense selected for deletion');
    this.showDeleteConfirmation = false;
    return;
  }

    this.deleteExpense(id).then(result => {
      if (result.success) {
        this.showExpenseSuccessMessage('Expense deleted successfully!');
        this.checkBudgetStatus(true)
      } else {
        this.showExpenseSuccessMessage(result.message || 'Failed to delete expense');
      }
      this.showDeleteConfirmation = false; // Hide confirmation after the operation
      this.expenseToDelete = null; // Clear the stored expense id
    });
  },

  cancelDeleteExpense() {
    this.showDeleteConfirmation = false; // Hide confirmation if user cancels
    this.expenseToDelete = null; // Clear the stored expense id
  },

     handleError(error) {
    console.error('Component error:', error);
    this.error = error.message || 'An unexpected error occurred';
  },
  resetError() {
    this.error = null;
    this.mounted(); // Retry initialization
  },
     
     resetForm() {
       this.expenseType = '';
       this.customExpenseType = '';
       this.itemName = '';
       this.itemPrice = '';
       this.editId = null;
       this.action = 'add';
     },
 
     showBudgetSuccessMessage(message) {
       if (this.budgetSuccessTimeout) {
         clearTimeout(this.budgetSuccessTimeout);
       }
       
       this.budgetHideMessage = false;
       this.budgetSuccessMessage = message;
       
       this.budgetSuccessTimeout = setTimeout(() => {
         this.budgetHideMessage = true;
         setTimeout(() => {
           this.budgetSuccessMessage = '';
         }, 500);
       }, 2500);
     },
     
     showExpenseSuccessMessage(message) {
  if (this.expenseSuccessTimeout) {
    clearTimeout(this.expenseSuccessTimeout);
    this.expenseSuccessTimeout = null;
  }
  
  this.expenseHideMessage = false;
  this.expenseSuccessMessage = message;
  
  this.expenseSuccessTimeout = setTimeout(() => {
    this.expenseHideMessage = true;
    this.expenseSuccessTimeout = setTimeout(() => {
      this.expenseSuccessMessage = '';
      this.expenseSuccessTimeout = null;
    }, 500);
  }, 2500);
},
 
     getCurrentBudgetId() {
       return this.getCurrentBudget ? this.getCurrentBudget.id : null;
     }
   }
  };
 </script>

 
<style scoped>
.update-success-message {
  text-align: center;
  padding: 20px;
}

.success-icon {
  color: #3a9d8f;
  font-size: 50px;
  margin-bottom: 20px;
}

.ok-button {
  background-color: #3a9d8f;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
}

.ok-button:hover {
  background-color: #6fcfa5;
}
.modal-overlay7 {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content7.photo-edit-modal {
  background-color: #f9fefc;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  margin: 20px auto;
  padding: 0;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-height: 90vh;
}

.modal-header7 {
  padding: 30px 30px;
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

.modal-header7 h3 {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  font-size: 1.6rem;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.close-button7 {
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

.modal-header7 .close-button:hover {
  color: #f9fefc;
  background: rgba(255, 255, 255, 0.15);
}
.modal-body7 {
  padding: 16px 20px;
  background-color: #eefbf5; 
}

.form-group7 {
  margin-bottom: 15px;
}

.form-group7 label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
  color: #4f7a6b;
}

.form-group7 textarea {
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

.form-group7 input[type="file"] {
  width: 96%;
  padding: 8px;
  border: 1px solid #c0c0c0;
  border-radius: 4px;
}

.photo-preview7 {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.photo-preview7 img {
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.form-actions7 {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
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
  transform: translateY(0px); /* Slight lift */
  transition: background 0.3s ease;
}

.edit-photo-btn:hover {
  background: linear-gradient( 135deg, #9fcfc1,#7fb1a3, #5e8f7d );
}

.photo-actions {
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
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
.upload-success-message {
  text-align: center;
  padding: 20px;
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


.modal-body2 {
  padding: 20px;
  background-color: #ffebee;
}

.confirmation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Photos Tab Styles */
.modal-overlay5 {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content5 {
  background-color: #f9fefc;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  margin: 20px auto;
  padding: 0;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-height: 90vh;
}

.modal-header5 {
  padding: 30px 30px;
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
  color: #4f7a6b;
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
  max-height: 500px;
  overflow-y: auto;
}

.photos-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: -40px;
  margin-bottom: 20px;
}

.photos-title {
  display: flex;
  flex-direction: column;
  gap: 6px; /* Adds space between title and description */
}

.photos-title h2 {
  font-size: 22px;
  color: #8bbcae; /* lighter fresh greenish shade */
  margin-bottom: 6px;
  font-weight: 600; /* slightly bolder */
  letter-spacing: 0.03em; /* subtle spacing for elegance */
}

.photos-title p{
  font-size: 1rem;
  color: #47806f; /* medium light shade */
  padding-left: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-style: italic; 
}


.upload-photo-btn {
  background: linear-gradient(135deg, #9fccbd, #6eb3a3, #82b2a1);
  color: white;
  font-size: 15px;
  border: none;
  padding: 13px 30px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-top: 20px;
  gap: 8px;
  transition: background 0.3s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  border: 2px solid #6a9c89;
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
  max-width: 500px;
}

.photo-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5px; /* reduced from 10px */
}

.photo-preview img {
  max-width: 200px !important; /* smaller than 100px */
  height: auto;
  border-radius: 6px; /* slightly smaller corners */
  border: 1px solid #ccc;
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

.expense-photo-tabs {
  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center;     /* Center vertically */
  border-bottom: 2px solid #d5d4d4;
  margin-bottom: 20px;
  text-align: center;
  gap: 300px; /* Optional: spacing between buttons */
}


.expense-photo-tabs button {
  padding: 12px 24px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  position: relative;
  color: #666;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 6px 6px 0 0;
  text-align: center;
}

.expense-photo-tabs button:hover {
  background-color: #f5f5f5;
  color: #2a4935;
}

.expense-photo-tabs button.active {
  color: #2a4935;
  font-weight: 600;
  background-color: #f0f7f3;
}

.expense-photo-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #2a4935;
  border-radius: 3px;
}

.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.3s;
}

.tab-btn i {
  margin-right: 8px;
}

.tab-btn.active {
  color: #4a89dc;
  border-bottom-color: #4a89dc;
  font-weight: bold;
}

.tab-btn:hover:not(.active) {
  color: #333;
  border-bottom-color: #ccc;
}

/* Photos view styling */
.photos-view {
  padding: 15px;
}

.photo-upload {
  margin-bottom: 20px;
}

.upload-btn {
  background-color: #4a89dc;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.upload-btn:hover {
  background-color: #3a70c2;
}

.photo-preview {
  margin-top: 15px;
  border: 1px dashed #ddd;
  padding: 15px;
  border-radius: 4px;
}

.photo-preview img {
  max-width: 100%;
  max-height: 200px;
  display: block;
  margin-bottom: 10px;
}

.photo-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.description-input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.photo-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.photo-item {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.photo-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  cursor: pointer;
}

.photo-meta {
  padding: 10px;
  background: #f9f9f9;
}

.photo-desc {
  margin: 0 0 5px 0;
  font-size: 14px;
}

.photo-date {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.delete-photo {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  float: right;
}


.submit-button1, .cancel-button1 {
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
}

.submit-button1 {
  background: linear-gradient(135deg, #9fccbd, #6eb3a3, #82b2a1);
  text-shadow: 2px 1px 3px rgba(0, 0, 0, 0.352);
  color: white;
  box-shadow: 0 2px 5px rgba(106, 156, 137, 0.4);
}

.submit-button1:hover:not(:disabled) {
  background: linear-gradient(135deg, #7aa98c, #5e8873, #486858);
  box-shadow: 0 4px 10px rgba(74, 109, 92, 0.6);
}

.cancel-button1 {
  background: linear-gradient(to bottom, #5e5e5e, #3f3f3f); /* dark gray gradient */
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cancel-button1:hover {
  background: linear-gradient(to bottom, #4a4a4a, #2f2f2f); /* slightly darker on hover */
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.cancel-button, .confirm-button {
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
}

.cancel-button {
  background: linear-gradient(to bottom, #5e5e5e, #3f3f3f); /* dark gray gradient */
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cancel-button:hover {
  background: linear-gradient(to bottom, #4a4a4a, #2f2f2f); /* slightly darker on hover */
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.confirm-button {
  background: linear-gradient(135deg, #e57373, #d32f2f, #b71c1c);
  color: white;
  box-shadow: 0 2px 5px rgba(211, 47, 47, 0.4);
}

.cancel-button:hover {
  background: linear-gradient(to bottom, #4a4a4a, #2f2f2f); /* slightly darker on hover */
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.confirm-button:hover{
  background: linear-gradient(135deg, #d32f2f, #b71c1c, #7f0000);
  box-shadow: 0 4px 10px rgba(123, 0, 0, 0.6);
}

/* .photo-viewer-modal {
   Your existing modal styles 
}*/

.btn-confirm, .btn-cancel1 {
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
}

.btn-confirm {
  background: linear-gradient(to bottom, #5e5e5e, #3f3f3f); /* dark gray gradient */
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.btn-cancel1 {
  background: linear-gradient(135deg, #e57373, #d32f2f, #b71c1c);
  color: white;
  box-shadow: 0 2px 5px rgba(211, 47, 47, 0.4);
}

.btn-confirm:hover {
  background: linear-gradient(to bottom, #4a4a4a, #2f2f2f); /* slightly darker on hover */
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-cancel1:hover{
  background: linear-gradient(135deg, #d32f2f, #b71c1c, #7f0000);
  box-shadow: 0 4px 10px rgba(123, 0, 0, 0.6);
}

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
  max-height: 70vh; /* Limit height to 70% of the viewport */
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
  font-weight: 800;
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
  right: 3px;
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
  border: 1px solid  #6a9c89;;
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
.expenses-section h3 i {
  margin-right: 8px; 
}
.smooth-scroll {
  scroll-behavior: smooth;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-budget-warning {
  color: #dc3545;
  margin-top: 10px;
  font-size: 0.9em;
}
.text-danger {
  color: #c62828;
}
.budget-form input[type="month"] {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: white;
  color: #333;
}

.month-selector button:hover {
  background: #e0e0e0;
}

.month-selector span {
  min-width: 150px;
  padding: 0 12px;
  text-align: center;
  font-weight: bold;
}

.predicting-text {
  color: #555;
  font-style: italic;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: block;
  margin-top: 2px;
  opacity: 0.85;
}

.prediction-feedback {
  margin-top: 10px;
  padding: 5px;
  background: linear-gradient(to right, #fafafa, #f0f0f0);
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 0.95rem;
}

.feedback-btn {
  margin-right: 8px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease, transform 0.2s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.feedback-btn.correct {
  background: #4CAF50;
  color: white;
}

.feedback-btn.correct:hover {
  background: #45a049;
  transform: scale(1.05);
}

.feedback-btn.incorrect {
  background: #f44336;
  color: white;
}

.feedback-btn.incorrect:hover {
  background: #e53935;
  transform: scale(1.05);
}


.budget-alert {
  position: fixed;
  top: 290px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ffebee;
  border: 1px solid #ef9a9a;
  border-radius: 6px;
  padding: 20px 30px; /* Increased padding */
  max-width: 520px;
  min-width: 250px;    /* Optional: ensures a wider box */
  color: #c62828;
  font-weight: bold;
  font-size: 1.2em;    /* Increased font size */
  z-index: 1000;
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  animation: slideDown 0.3s ease-out;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.alert-icon {
  font-size: 1.5em;
}

.dismiss-btn {
  background: none;
  border: none;
  color: #c62828;
  font-size: 1.8em;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.dismiss-btn:hover {
  background-color: rgba(198, 40, 40, 0.1); /* light red tint */
  color: #b71c1c;
  transform: scale(1.05);
}



/* Floating Delete Confirmation Alert */
.floating-alert {
  position: fixed;
  top: 290px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ffebee;
  border: 1px solid #ef9a9a;
  border-radius: 6px;
  padding: 20px 30px; /* Increased padding */
  min-width: 350px;    /* Optional: ensures a wider box */
  color: #c62828;
  font-weight: bold;
  font-size: 1.2em;    /* Increased font size */
  z-index: 1000;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  animation: slideDown 0.3s ease-out;
}

.floating-alert button {
  padding: 10px 10px;
  margin-left: 10px;
  width: 80px;
}


@keyframes slideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
} /*NEWWWWWWWWWWWW */

.main-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
}

.top-row {
  margin-top: 100px;
  display: flex;
  flex-wrap: nowrap; 
  gap: 35px;
  width: 90%;
  flex-direction: row;
  justify-content: center;     /* Centers items horizontally */
  margin-left: auto;           /* Centers the container */
  margin-right: auto;
} 

.budget-container {
  flex: 1 1 350px;
  min-width: 150px;
  height: auto;
  max-height: 650px;
  background: linear-gradient(135deg, #fdfffe, #ecf9f6, #def4f1);
  padding: 20px;
  border-radius: 15px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.293);
  color: #1e3a2b;
  font-size: 1.05rem;
}

.budget-header {
  flex-wrap: nowrap;
  justify-content: space-between;
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.budget-header h3 {
  color: #183d2a;
  font-size: 1.8rem;
  margin-right: 25px;
  margin-bottom: 20px;
  font-weight: bold;
}

.budget-content {
  width: 100%;
}

.btn-add, .btn-edit {
  background: linear-gradient(135deg, #6fcfa5, #3a9d8f); /* Harmonized green gradient */
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  max-width: 80px;
  display: inline-block;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  font-weight: 600;
  letter-spacing: 0.05em;
}

/* Subtle radial highlight effect */
.btn-add::before,
.btn-edit::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
  pointer-events: none;
}

.btn-add:hover::before,
.btn-edit:hover::before {
  opacity: 1;
}

.btn-add:hover, .btn-edit:hover {
  background: linear-gradient(135deg, #4f946c, #296e66);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
  font-weight: 700;
  letter-spacing: 0.1em;
}

.budget-display {
  flex-wrap: wrap;
  background: rgba(91, 83, 83, 0.068);
  padding: 20px;
  border-radius: 10px;
}

.budget-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.budget-month-row, .budget-amount-row {
  flex-wrap: wrap;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.budget-label {
  font-weight: 500;
  font-size: 1rem;
}
.budget-month, .budget-amount {
  font-weight: 600;
  font-size: 1.1rem;
}

.budget-amount {
  background-color: #ffffff;           /* clean white for contrast */
  border: 2px solid #6A9C89;           /* soft green border */
  padding: 12px 16px;
  border-radius: 10px;
  color: #388e3c;                      /* dark green for label */
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-weight: 650;
  font-size: 18px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.budget-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
}

.budget-form .form-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}


.amount-value {
  color: #2e7d32;                      /* slightly darker green */
  font-size: 18px;
}

.budget-form label {
  min-width: 60px;
}

.budget-form input, .budget-form select {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: white;
  color: #333;
}

.budget-form-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  box-sizing: border-box;
  margin-top: 20px;
  width: 100%;
}

.budget-btn {
  padding: 12px 0;
  background-color: #2a4935;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  flex: 1;
}

.budget-btn:hover {
  background: #dcdcdc; 
  color: #333333;
  transform: translateY(-2px);
}

.cancel-btn {
  background-color: #6c757d;
}

.cancel-btn:hover {
  background-color: #4b5256;
  color: white;
}

.budget-success-message {
  background-color: #d4edda;
  color: #1d4d2b;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  text-align: center;
  transition: opacity 0.5s ease;
  font-size: 1rem;
}
  
.budget-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.month-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 12px;
  font-size: 1.2rem;
  color: #1b3d2f;
}

.month-selector button {
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #6fcf97, #3a9d8f);
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.month-selector button:hover {
  background: linear-gradient(135deg, #63a485, #255a52);
  color: white;
  transform: translateY(-1.5px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}

.expenses-summary {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}


.expenses-summary1 {
  background-color: #f5f5f5; ;            
  border: 2px solid #697565;
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  width: 100%;
  margin-top: 10px;
}

.expenses-amount,
.remaining-budget {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  font-weight: 550;
  margin-bottom: 8px;
  color: #444;
}


.budget-progress {
  margin-top: 2px;
}

.progress-bar {
  height: 16px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background-color: #2a4935;
  transition: width 0.3s;
}

.progress-fill.exceeded {
  background-color: #f44336;
}

.progress-text {
  text-align: right;
  font-size: 1.1rem;
  color: #1a3d2c;
}

.budget-form-modal {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.budget-form {
  background: linear-gradient(145deg, #fefefe, #f0fdfa);
  color: #2e4e40;
  padding: 20px;
  border-radius: 14px;
  width: 90%;
  max-width: 370px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  animation: fadeSlideUp 0.3s ease;
  font-family: "Segoe UI", sans-serif;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  gap: 8px;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: center;
}

.btn-save {
  background: linear-gradient(135deg, #6fcfa5, #3a9d8f);
  color: #fff;
  border: none;
}

.btn-save:hover {
  background-color: #6a9c89;
  transform: scale(1.03);
}

.btn-cancel {
  background-color: #f8f8f8;
  color: #555;
  border: 1px solid #ccc;
}

.btn-cancel:hover {
  background-color: #e9f2f0;
  transform: scale(1.02);
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading {
  text-align: center;
  padding: 20px;
}

.expense-success-message {
  background-color: #d4ede8;
  color: #155724;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  text-align: center;
  transition: opacity 0.5s ease;
} /* for expenses*/

.budget-success-message.hide,
.expense-success-message.hide {
  opacity: 0;
}


.uneditable-month {
  display: inline-block;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-weight: bold;
  text-align: center;
  min-width: 50px;
  width: 120px;
}
 
 .content-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  flex: 1 1 60%;
  min-width: 200px;
  background: #fafffe;
  border: none;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.286);
  height: auto;
}

.expenses-container {
  margin: 30px auto 20px;
  box-sizing: border-box;
  width: 90%;
  max-height: 680px;
  background-color: white;
  padding: 20px;
  border-radius: 15px;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.242);
  transition: all 0.3s ease;
}

 .expense-form {
  text-align: center;
  width: 100%; 
  transition: all 0.3s ease;
  scroll-margin-top: 200px;
}  
 

.expenses-section {
  margin-top: 10px;   
}

.expenses-section h3 {
  text-align: center;
  align-content: center;
  margin-top: 20px;
  color: #2e2e2e;
  font-size: 1.5rem; 
  padding-bottom: 10px;
  border-bottom: 2px solid #e1e1e1; 
  font-weight: 600;
} 

h3{
  margin-bottom: 0;
}

.expenses-table {
  max-height: 400px; 
  overflow-y: auto;
  margin: 0;
}  

table {
  width: 100%;
  border-collapse: separate; 
  border-spacing: 0 10px; 
  margin-bottom: 20px; 
}  

th, td {
  padding: 6px 20px; 
  text-align: center;
  border-bottom: 1px solid #d7e2dc;
  vertical-align: middle;
  user-select: none;
  font-size: 0.95rem;
} 

th {
  background: linear-gradient(135deg, #6fcfa5, #3ea799);
  font-weight: 700;
  font-size: 1rem; 
  padding: 12px 20px; 
  color: white;
  text-transform: uppercase;
  border-bottom: 2px solid #4f7a6b;
  box-shadow: 0 2px 6px rgba(74, 109, 92, 0.3);
  border-radius: 18px 18px 0 0;
} 

tr {
  background-color: #fbfbfb;
  box-shadow: 0 10px 10px rgba(0,0,0,0.05); 
  margin-bottom: 15px; 
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
}

tr:hover {
  background-color: #ecfff7;
  transform: translateY(-2px); 
  box-shadow: 0 10px 12px rgba(0,0,0,0.08); 
   transition: background-color 0.25s ease, box-shadow 0.25s ease;
} 

td, th {
  vertical-align: middle;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
} 

.edit-btn, .delete-btn {
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
}

.edit-btn {
  background: linear-gradient(135deg, #6fcfa5, #3a9d8f);
  color: white;
  box-shadow: 0 2px 5px rgba(106, 156, 137, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, #e57373, #d32f2f, #b71c1c);
  color: white;
  box-shadow: 0 2px 5px rgba(211, 47, 47, 0.4);
}

.edit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #7aa98c, #5e8873, #486858);
  box-shadow: 0 4px 10px rgba(74, 109, 92, 0.6);
}

.delete-btn:hover:not(:disabled)  {
  background: linear-gradient(135deg, #d32f2f, #b71c1c, #7f0000);
  box-shadow: 0 4px 10px rgba(123, 0, 0, 0.6);
}

@keyframes pulse {
  0% {
    transform: translateY(-2px) scale(1);
  }
  50% {
    transform: translateY(-2px) scale(1.05);
  }
  100% {
    transform: translateY(-2px) scale(1);
  }
}

.edit-btn:active, .delete-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.total {
     font-size: 20px;
     font-weight: bold;
     color: #333;
     padding: 15px;
     background-color: #d1e7e4;
     box-sizing: border-box;
     box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
     text-align: center;
     width: 100%;
     position: relative; 
     bottom: 0;  
     border-radius: 12px;
     margin-top: 10px;
}

.form-title {
  background: linear-gradient(135deg, #b8f0db, #9fe3c9, #94dfd3);
  color: white;
  padding: 14px 20px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 2px 1px 2px rgba(0, 0, 0, 0.427);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
}


.form-group1,
.form-group {
  margin-bottom: 20px;
}

.form-group1 label,
.form-group label {
  margin-bottom: 4px;
  color: #26665e;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: left;
  margin-left: 4px;
  display: block;
}

.form-group h3 {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 20px;
  margin-top: 0;
  color: #183d2a;
  border-radius: 20px; 
  background: linear-gradient(135deg, #e8ffec, #def4ee, #c4fff1 );
  padding: 20px 16px;
  position: relative;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 6px rgba(64, 64, 64, 0.301);
  letter-spacing: 0.5px;
}

.form-group h3::before {
  content: "📝";
  margin-right: 10px;
  font-size: 1.1rem;
  vertical-align: middle;
}


.form-input,
input[type="text"],
input[type="number"],
select {
  width: 100%;
  padding: 8px 10px;
  font-size: 0.95rem;
  border-radius: 8px;
  border: 1.8px solid #26665e;
  background-color: #f7f9f8;
  color: #333;
  box-sizing: border-box;
  min-height: 32px;
  transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus,
input[type="text"]:focus,
input[type="number"]:focus,
select:focus {
  outline: none;
  border-color: #4f7a6b;
  background-color: #fff;
  box-shadow: 0 0 0 2px rgba(143, 176, 163, 0.2);
}

.form-input[disabled],
input[disabled],
select[disabled] {
  background-color: #f1f1f1;
  color: #777;
  cursor: not-allowed;
}

 
.btn {
  padding: 12px 50px;
  background: linear-gradient(135deg, #6fcfa5, #3a9d8f); /* More vibrant green tones */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.4px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.4s ease;
}

.btn:hover::before {
  left: 100%;
}

.btn:hover {
  background: linear-gradient(135deg, #88e0b5, #32786e); /* Subtle hover shift */
  color: #ffffff;
  transform: translateY(-2px);
}


.btn1 {
    padding: 12px 50px;
    background-color: white;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    color: black;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 15px;
    margin-top: 10px; /* Add vertical spacing instead */
    margin-left: 430px;
    transition: background-color 0.3s, color 0.3s;
}

.btn1:hover {
    background-color: rgb(26, 25, 25); /* Change to any color you want */
    color: white; /* Text color on hover */
}


@media (max-width: 1200px) {
  .month-selector span{
    min-width: 80px;
    padding: 10px;
    text-align: center;
    font-weight: bold;
  }
}

@media (max-width: 1030px) {
 .budget-header {
    display: flex;
    flex-wrap: wrap;
  }
}

@media (max-width: 760px) {
  .top-row {
    flex-wrap: wrap;
  }
  .month-selector span{
    min-width: 100px;
    padding: 0px;
  }
  .expenses-container {
    min-width: 300px;
  }
  .expense-photo-tabs {
    justify-content: space-between;
    gap: 10px;
  }
     .photos-tab {
    max-height: 500px;
  }
  .budget-form {
    width: 80%;
  }
}

</style>