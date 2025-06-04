<template>
    <div class="accept-invite">
      <Navigation />
      
      <div v-if="loading" class="loading">
        Processing invitation...
      </div>
      
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      
      <div v-else-if="success" class="success">
        <h2>Success!</h2>
        <p>{{ success }}</p>
        <button @click="goToGroup" class="btn-primary">
          Go to Group
        </button>
      </div>
      
      <div v-else-if="needsLogin" class="needs-login">
        <h2>Invitation Received</h2>
        <p>You need to log in to accept this invitation.</p>
        
        <div class="auth-options">
          <router-link to="/login" class="btn-primary">
            Log In
          </router-link>
          <router-link to="/register" class="btn-secondary">
            Sign Up
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Navigation from './navigation.vue';
  
  export default {
    components: { Navigation },
    data() {
      return {
        loading: true,
        error: '',
        success: '',
        needsLogin: false,
        groupId: null
      };
    },
    async created() {
      const token = this.$route.query.token;
      
      if (!token) {
        this.error = 'Invalid invitation link - missing token';
        this.loading = false;
        return;
      }
      
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userToken = localStorage.getItem('jsontoken');
        
        if (!user || !userToken) {
          this.needsLogin = true;
          this.loading = false;
          return;
        }
        
        const response = await this.$axios.get(
          `/api/grp_expenses/accept-invite?token=${token}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`
            }
          }
        );
        
        if (response.data.success) {
          this.success = response.data.message;
          this.groupId = response.data.groupId;
        } else {
          this.error = response.data.message || 'Failed to accept invitation';
        }
      } catch (err) {
        this.error = err.response?.data?.message || 
                   'An error occurred while processing your invitation';
        console.error('Accept invite error:', err);
      } finally {
        this.loading = false;
      }
    },
    methods: {
      goToGroup() {
        if (this.groupId) {
          this.$router.push({
            name: 'Group',
            params: { groupId: this.groupId }
          });
        } else {
          this.$router.push('/GC');
        }
      }
    }
  };
  </script>