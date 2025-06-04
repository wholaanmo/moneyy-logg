<template>
    <div class="reset-container">
      <div class="reset-form">
        <h2>Reset Password</h2>
        <div class="input-group">
          <label>New Password</label>
          <input v-model="newPassword" type="password" placeholder="Enter new password">
        </div>
        <div class="input-group">
          <label>Confirm Password</label>
          <input v-model="confirmPassword" type="password" placeholder="Confirm new password">
        </div>
        <button @click="resetPassword" class="reset-btn">Reset Password</button>
        <p v-if="message" :class="{ 'success': success, 'error': !success }">{{ message }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useRoute, useRouter } from 'vue-router';
  import { verify } from 'jsonwebtoken';
  
  export default {
    setup() {
      const route = useRoute();
      const router = useRouter();
      const token = ref('');
      const email = ref(''); 
      const newPassword = ref('');
      const confirmPassword = ref('');
      const message = ref('');
      const success = ref(false);
  
      onMounted(() => {
      token.value = route.query.token;
      if (!token.value) {
        router.push('/login');
      } else {
        // Decode token to get email
        try {
          const decoded = verify(token.value, "qwe1234");
          email.value = decoded.email;
        } catch (err) {
          console.error('Token verification failed:', err);
          router.push('/login');
        }
      }
    });
  
      const resetPassword = async () => {
        if (newPassword.value !== confirmPassword.value) {
          message.value = 'Passwords do not match';
          return;
        }
  
        try {
          const response = await axios.post(
            'http://localhost:3000/api/users/reset-password-otp',
            {
              email: email.value, // Include email
            newPassword: newPassword.value,
            token: token.value
          }
          );
  
          if (response.data.success) {
            success.value = true;
            message.value = 'Password reset successfully. You can now login with your new password.';
            setTimeout(() => router.push('/login'), 3000);
          } else {
            message.value = response.data.message || 'Failed to reset password';
          }
        } catch (error) {
        console.error('Full password reset error:', error);
        console.error('Response data:', error.response?.data);
        message.value = error.response?.data?.message || 'Error resetting password. Please try again.';
      }
    };
  
      return {
        newPassword,
        confirmPassword,
        message,
        success,
        resetPassword
      };
    }
  };
  </script>
  
  <style scoped>
  .reset-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
  }
  
  .reset-form {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 400px;
  }
  
  .input-group {
    margin-bottom: 20px;
  }
  
  .input-group label {
    display: block;
    margin-bottom: 5px;
  }
  
  .input-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .reset-btn {
    width: 100%;
    padding: 12px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
  }
  
  .reset-btn:hover {
    background-color: #45a049;
  }
  
  .success {
    color: green;
    margin-top: 15px;
  }
  
  .error {
    color: red;
    margin-top: 15px;
  }
  </style>