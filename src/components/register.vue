<template>
  <div class="register-bg">
      <div class="container">
          <div class="login-container">
              <div class="login-form">
                  <form @submit.prevent="registerUser">
                      <div class="login-form-items">
                          <span class="login-label">REGISTER</span>
  
                          <div class="text-input-container">
                              <label class="form-label">FIRST NAME</label>
                              <input type="text" name="first_name" v-model="first_name" class="text-style" required />

                              <label class="form-label">LAST NAME</label>
                              <input type="text" name="last_name" v-model="last_name" class="text-style" required />

                              <label class="form-label">USERNAME</label>
                              <input type="text" name="username" v-model="username" class="text-style" required />

                              <label class="form-label">EMAIL</label>
                              <input type="email" name="email" v-model="email" class="text-style" required />

                              <label class="form-label">PASSWORD</label>
                              <div class="password-input-wrapper">
                                  <input 
                                      :type="showPassword ? 'text' : 'password'" 
                                      name="password" 
                                      v-model="password" 
                                      class="text-style1" 
                                      required 
                                  />
                                  <span 
                                      class="password-toggle" 
                                      @click="showPassword = !showPassword"
                                  >
                                  <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                                  </span>
                              </div>
                              

                              <label class="form-label">PASSWORD CONFIRMATION</label>
                              <div class="password-input-wrapper">
                                  <input 
                                      :type="showConfirmPassword ? 'text' : 'password'" 
                                      name="password_confirmation" 
                                      v-model="password_confirmation" 
                                      @input="checkPasswordStrength"
                                      class="text-style1" 
                                      required 
                                  />
                                  <span 
                                      class="password-toggle" 
                                      @click="showConfirmPassword = !showConfirmPassword"
                                  >
                                  <i :class="showConfirmPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                                  </span>
                              </div>
                              <p class="password-hint">
                              Password must contain uppercase or lowercase letter, number, and special character.
                              </p>
  <div class="password-strength-meter">
      <div 
          :class="['strength-bar', strengthClass]" 
          :style="{ width: strengthPercentage + '%' }"
      ></div>
  </div>
  <div class="password-feedback" :class="strengthClass" v-if="password.length > 0">
      {{ strengthMessage }}
  </div>
                          </div>

                          <div class="privacy-policy-container">
                              <input 
                                  type="checkbox" 
                                  id="privacyPolicy" 
                                  v-model="acceptedPrivacyPolicy" 
                                  class="privacy-checkbox"
                                  required
                              />
                              <label for="privacyPolicy" class="privacy-label">
                                  I agree to the <a href="#" @click.prevent="showPrivacyModal = true" class="privacy-link">Privacy Policy</a>
                              </label>
                          </div>

                          <p v-if="serverMessage" class="message" :class="{ 'error-message': isError, 'success-message': !isError }">
                              {{ serverMessage }}
                          </p>

                          <button type="submit" class="login-btn">SIGN UP</button>
                          <router-link to="/login" class="login-btn1">SIGN IN</router-link>
                          <router-link to="/about" class="about-link">💰
                                      About Money Log System
                          </router-link>
                      </div>
                      <div v-if="showOTPModal" class="modal-overlay">
                              <div class="modal-container">
                                  <div class="modal-header">
                                      <h2>Email Verification</h2>
                                      <button @click="showOTPModal = false" class="modal-close-btn">&times;</button>
                                  </div>
                                  <div class="modal-content">
                                      <p>We've sent a 6-digit verification code to your email address. Please enter it below:</p>
                                      
                                      <div class="otp-input-container">
                                          <input 
                                              type="text" 
                                              v-model="otp" 
                                              maxlength="6" 
                                              class="otp-input" 
                                              placeholder="Enter OTP"
                                          />
                                      </div>
                                      
                                      <p v-if="otpMessage" class="message" :class="{ 'error-message': isOtpError, 'success-message': !isOtpError }">
                                          {{ otpMessage }}
                                      </p>
                                      
                                      <button @click="verifyEmail" class="verify-btn">Verify Email</button>
                                      <button @click="resendOTP" class="resend-btn">Resend OTP</button>
                                  </div>
                                  </div>
                                  </div>
                  </form>    
              </div>
              <div class="login-deco-container">
                  <div class="login-deco">
                      <span class="penny">MONEY <br> LOG</span>
                      <img src="/LOGO.png" alt="Logo Image" class="deco-image">  
                  </div>
              </div>
          </div>
      </div>
  </div>

  <!-- Privacy Policy Modal -->
  <div v-if="showPrivacyModal" class="modal-overlay" @click.self="showPrivacyModal = false">
      <div class="modal-container">
          <div class="modal-header">
              <h2>Money Log Privacy Policy</h2>
              <button @click="showPrivacyModal = false" class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-content">
              <h3>Your Financial Data Security Is Our Priority</h3>

              <div class="modal-column">
              <div class="policy-section">
                  <h4>1. Information We Collect</h4>
                  <p>To provide our budget tracking services, we collect:</p>
                  <ul>
                  <li><strong>Account Information:</strong> Username, email, and encrypted password</li>
                  <li><strong>Financial Data:</strong> 
                      <ul>
                      <li>Individual expense amounts, dates, and categories (food, bills, transportation, etc.)</li>
                      <li>Budget limits and remaining balances</li>
                      <li>Group expense allocations and member contributions</li>
                      </ul>
                  </li>
                  <li><strong>Usage Data:</strong> How you interact with our features (expense filtering, visualization preferences, etc.)</li>
                  </ul>
              </div>

              <div class="policy-section">
                  <h4>2. How We Use Your Financial Data</h4>
                  <p>We process your information exclusively to:</p>
                  <ul>
                  <li>Generate accurate budget reports and spending analyses</li>
                  <li>Power our visualization tools (pie charts, tables, etc.)</li>
                  <li>Calculate group expense allocations and balances</li>
                  <li>Enable date filtering and transaction categorization</li>
                  <li>Improve core features like expense editing/deletion</li>
                  <li>Secure your account and prevent unauthorized access</li>
                  </ul>
              </div>

              <div class="policy-section">
                  <h4>3. Group Expense Specifics</h4>
                  <p>For shared expense features:</p>
                  <ul>
                  <li>Group creators can see member contributions but not their other private expenses</li>
                  <li>Expense details shared within groups are encrypted</li>
                  <li>You can leave groups at any time to stop data sharing</li>
                  </ul>
              </div>

              <div class="policy-section">
                  <h4>4. Your Rights & Controls</h4>
                  <p>You can:</p>
                  <ul>
                  <li>Export all expense data (PDF format)</li>
                  <li>Permanently delete individual transactions or entire accounts</li>
                  </ul>
              </div>
              </div>

              <div class="data-privacy">
                  <h3>Compliance with the Data Privacy Act of the Philippines</h3>
                  <p>Money Log is committed to protecting your personal data in accordance with <strong>Republic Act No. 10173, the Data Privacy Act of 2012</strong>. We ensure that:</p>
                  <ul>
                      <li><strong>Transparency:</strong> You are informed about the data we collect and how it is used.</li>
                      <li><strong>Legitimate Purpose:</strong> Your data is processed only for services you have opted into.</li>
                      <li><strong>Proportionality:</strong> We collect only data necessary for providing our financial tracking services.</li>
                      <li><strong>Data Subject Rights:</strong> You have the right to access, correct, and erase your personal data.</li>
                      <li><strong>Security Measures:</strong> We implement administrative, technical, and physical safeguards to protect your data.</li>
                  </ul>
              </div>

              
              <div class="policy-highlights">
                  <h3>Key Privacy Features:</h3>
                  <div class="highlight-grid">
                      <div class="highlight-item">
                          <div class="highlight-icon">🔒</div>
                          <div>We never sell or share your financial data</div>
                      </div>
                      <div class="highlight-item">
                          <div class="highlight-icon">🛡️</div>
                          <div>Group expenses are encrypted end-to-end</div>
                      </div>
                      <div class="highlight-item">
                          <div class="highlight-icon">🗂️</div>
                          <div>Deleting a group will immediately delete all related data.</div>
                      </div>
                      <div class="highlight-item">
                          <div class="highlight-icon">🗑️</div>
                          <div>Immediate deletion upon account termination</div>
                      </div>
                  </div>
              </div>
              
              <p class="last-p">By using Money Log, you consent to this privacy-focused data handling.</p>
          </div>
          <div class="modal-footer">
              <button @click="showPrivacyModal = false" class="modal-close-btn">I Understand</button>
          </div>
      </div>       
  </div>
</template>

<script>
import { ref, inject, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

export default {
setup() {
  const router = useRouter()
  const route = useRoute()
  const first_name = ref('')
  const last_name = ref('')
  const someInjectedValue = inject('key')
  const username = ref('')
  const email = ref('')
  const password = ref('')
  const password_confirmation = ref('')
  const serverMessage = ref('')
  const isError = ref(false)
  const acceptedPrivacyPolicy = ref(false)
  const showPrivacyModal = ref(false)
  const redirectAfterLogin = ref('') 
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
   // OTP Verification
   const showOTPModal = ref(false)
  const otp = ref('')
  const otpMessage = ref('')
  const isOtpError = ref(false)
  const tempToken = ref('')


      const inviteToken = route.query.inviteToken
  if (inviteToken) {
    redirectAfterLogin.value = `/api/grp_expenses/accept-invite?token=${inviteToken}`
  }

  const acceptInvitation = async (token) => {
    try {
      const response = await axios.get(
        `/api/grp_expenses/accept-invite?token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
          }
        }
      );
      
      if (response.data.success) {
        router.push({
          name: 'Group',
          params: { groupId: response.data.groupId },
          query: { invite_accepted: 'true' }
        });
      }
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      serverMessage.value = error.response?.data?.message || 'Failed to process invitation';
      isError.value = true;
    } finally {
      localStorage.removeItem('invitationToken');
    }
  };

  onMounted(() => {
    const token = route.query.token; // Now using the properly imported route
    if (token) {
      localStorage.setItem('invitationToken', token);
    }
  });

  const handleRegistrationSuccess = async (response) => {
    serverMessage.value = "Registration successful!";
    isError.value = false;
    
    // Store the token if available
    if (response.data.token) {
      localStorage.setItem('jsontoken', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.user.id,
        username: response.data.user.username,
        email: response.data.user.email
      }));
    }

    // Check for invitation token
    const token = localStorage.getItem('invitationToken');
    if (token) {
      await acceptInvitation(token);
    } else if (redirectAfterLogin.value) {
      // Redirect to the invite URL after registration
      window.location.href = redirectAfterLogin.value;
    } else {
      setTimeout(() => router.push('/login'), 1500);
    }
  };

  const hasMinLength = computed(() => password.value.length >= 8)
  const hasUppercase = computed(() => /[A-Z]/.test(password.value))
  const hasLowercase = computed(() => /[a-z]/.test(password.value))
  const hasNumber = computed(() => /[0-9]/.test(password.value))
  const hasSpecialChar = computed(() => /[!@#$%^&*]/.test(password.value))

  const strengthScore = computed(() => {
    let score = 0
    if (password.value.length >= 8) score++
    if (/[A-Z]/.test(password.value)) score++
    if (/[a-z]/.test(password.value)) score++
    if (/[0-9]/.test(password.value)) score++
    if (/[!@#$%^&*]/.test(password.value)) score++
    return score
  })

  const strengthPercentage = computed(() => strengthScore.value * 20)
  
  const strengthClass = computed(() => {
    if (password.value.length === 0) return ''
    if (strengthScore.value <= 2) return 'weak'
    if (strengthScore.value <= 3) return 'medium'
    return 'strong'
  })

  const strengthMessage = computed(() => {
    if (password.value.length === 0) return ''
    switch(strengthClass.value) {
      case 'weak': return 'Weak Password'
      case 'medium': return 'Medium Strength'
      case 'strong': return 'Strong Password'
      default: return ''
    }
  })

  const registerUser = async () => {
    serverMessage.value = ''
    isError.value = false 
  
    if (!first_name.value || !last_name.value || !username.value || !email.value || !password.value || !password_confirmation.value) {
      serverMessage.value = "All fields are required!"
      isError.value = true
      return
    }
  
if (password.value !== password_confirmation.value) {
  serverMessage.value = "Passwords do not match!"
  isError.value = true
  return
}

if (!acceptedPrivacyPolicy.value) {
  serverMessage.value = "You must accept the privacy policy!"
  isError.value = true
  return
}

if (strengthScore.value < 4) { // Changed from <3 to <=2
  serverMessage.value = "Password must be strong! Include uppercase, lowercase, numbers, and special characters."
  isError.value = true
  return
}
  
try {
  const checkRes = await axios.post('http://localhost:3000/api/users/check-email', {
    email: email.value
  });

  if (checkRes.data.exists) {
    serverMessage.value = "Email already registered!";
    isError.value = true;
    return;
  }

      // First step: Send registration data to get OTP
          const res = await axios.post('http://localhost:3000/api/users/send-registration-otp', {
        first_name: first_name.value,
        last_name: last_name.value,
        username: username.value,
        email: email.value,
        password: password.value,
        accepted_privacy_policy: true
      });

      if (res.data.success === 1) {
        // Store temporary token for verification
        tempToken.value = res.data.tempToken
        // Show OTP modal
        showOTPModal.value = true
        otpMessage.value = "OTP sent to your email. Please check your inbox."
      } else {
        serverMessage.value = res.data.message || "Registration failed.";
        isError.value = true
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response?.data?.message) {
        serverMessage.value = error.response.data.message;
      } else {
        serverMessage.value = "Registration failed. Please try again.";
      }
      isError.value = true
    }
  };

  const verifyEmail = async () => {
try {
  const response = await axios.post(
    'http://localhost:3000/api/users/verify-registration-otp',
    { 
      otp: otp.value,
      first_name: first_name.value,
      last_name: last_name.value,
      username: username.value,
      email: email.value,
      password: password.value
    },
    {
      headers: {
        'Authorization': `Bearer ${tempToken.value}`
      }
    }
  );

  if (response.data.success) {
    otpMessage.value = "Email verified successfully! Redirecting to login...";
    isOtpError.value = false;
    
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } else {
    otpMessage.value = response.data.message || "Verification failed";
    isOtpError.value = true;
  }
} catch (error) {
  console.error("Verification error:", error);
  otpMessage.value = error.response?.data?.message || "Verification failed. Please try again.";
  isOtpError.value = true;
}
};

const resendOTP = async () => {
try {
  const response = await axios.post('http://localhost:3000/api/users/resend-registration-otp', {
    email: email.value,
    first_name: first_name.value, // Add this line
    tempToken: tempToken.value
  });

  if (response.data.success) {
    otpMessage.value = "New OTP sent to your email.";
    isOtpError.value = false;
  } else {
    otpMessage.value = response.data.message || "Failed to resend OTP";
    isOtpError.value = true;
  }
} catch (error) {
  console.error("Resend OTP error:", error);
  otpMessage.value = error.response?.data?.message || "Failed to resend OTP. Please try again.";
  isOtpError.value = true;
}
};

  
  return {
    first_name,
    last_name,
    username,
    email,
    password,
    password_confirmation,
    serverMessage,
    isError, 
    acceptedPrivacyPolicy,
    showPrivacyModal,
    showOTPModal,
    otp,
    otpMessage,
    isOtpError,
    verifyEmail,
    resendOTP,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    strengthPercentage,
    strengthClass,
    strengthMessage,
    registerUser,
    handleRegistrationSuccess,
    redirectAfterLogin,
    showPassword,
    showConfirmPassword,
  };
},
};
</script>
  
<style scoped>
.password-hint {
  font-size: 12px;
  color: #6b6b6b;
  margin: 0px 0 5px 0;
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

.modal-container {
background-color: white;
border-radius: 8px;
width: 400px;
max-width: 90%;
padding: 20px;
}

.modal-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 20px;
}

.modal-close-btn {
background: none;
border: none;
font-size: 24px;
cursor: pointer;
}

.otp-input-container {
margin: 20px 0;
}

.otp-input {
width: 97%;
padding: 10px;
font-size: 16px;
border: 1px solid #ccc;
border-radius: 4px;
text-align: center;
}

.verify-btn, .resend-btn {
padding: 10px 15px;
margin-right: 10px;
border: none;
border-radius: 4px;
cursor: pointer;
}

.verify-btn {
  background: linear-gradient(to right, #4CAF50, #66BB6A); /* Green gradient */
  color: white;
  margin-top: 5px;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.verify-btn:hover {
  background: linear-gradient(to right, #43A047, #5EBF63);
  transform: translateY(-1px);
}

.resend-btn {
  background: linear-gradient(to right, #2196F3, #42A5F5); /* Blue gradient */
  color: white;
  margin-top: 5px;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.resend-btn:hover {
  background: linear-gradient(to right, #1E88E5, #3DAAF5);
  transform: translateY(-1px);
}

   /*NEWWWWWWWWWW */
.password-input-wrapper {
  position: relative;
  width: 100%;
}

.password-toggle {
  position: absolute;
  right: 20px;
  top: 45%;
  color: #72aa95;
  transform: translateY(-50%);
  cursor: pointer;
  user-select: none;
}

.text-style {
  padding-right: 35px; /* Make room for the eye icon */
  width: 100%;
}
.server-message {
  color: red; 
}

.server-message.success {
  color: rgb(2, 155, 2);
}

.about-link {
  color: #3f6e5d; /* same as button's darkest green */
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 8px 12px;
  margin-top: 15px;
  margin-bottom: 5px;
  border-radius: 4px;
  transition: color 0.3s ease, text-decoration 0.3s ease;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.about-link:hover {
  color: #6fb499; 
  text-decoration: underline;
}



.password-strength-meter {
  height: 5px;
  background-color: #e0e0e0;
  border-radius: 3px;
  margin: 8px 0;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.strength-bar.weak {
  background-color: #ff4444;
}
.strength-bar.medium {
  background-color: #ffbb33;
}
.strength-bar.strong {
  background-color: #00C851;
}

.password-feedback {
  font-size: 0.85rem;
  margin-bottom: 0px;
  margin-top: -15px;
}
.password-feedback.weak {
  color: #ff4444;
}
.password-feedback.medium {
  color: #ffbb33;
}
.password-feedback.strong {
  color: #00C851;
}

.requirements-list {
  margin: 8px 0 0 20px;
  padding: 0;
  list-style-type: none;
  font-size: 0.8rem;
  color: #666;
}
.requirements-list li {
  margin: 3px 0;
  position: relative;
  padding-left: 20px;
}
.requirements-list li:before {
  content: "✗";
  position: absolute;
  left: 0;
  color: #ff4444;
}
.requirements-list li.met:before {
  content: "✓";
  color: #00C851;
}

.data-privacy {
margin-top: 1.5rem;
padding: 1rem;
background-color: #e4f3f0;
border-left: 4px solid #44695c;
border-radius: 6px;
}

.policy-highlights {
margin-top: 1.5rem;
padding: 1rem;
background-color: #e4f3f0;
border-left: 4px solid #44695c;
border-radius: 6px;
}

.highlight-grid {
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 1rem;
margin-top: 0.8rem;
}

.highlight-item {
display: flex;
align-items: flex-start;
gap: 0.6rem;
font-size: 0.85rem;
color: #36594e;
}

.highlight-icon {
font-size: 1.2rem;
}

.last-p {
margin-top: 1.2rem;
color: #bf3d3d;
font-size: 0.9rem;
}

.modal-content ul {
padding-left: 1.2rem;
}

.modal-content a {
  color: #4a6baf;
  text-decoration: none;
}

.modal-content a:hover {
  text-decoration: underline;
}

.modal-content li {
color: #3e554e;
font-size: 0.85rem;
}
.privacy-policy-container {
  margin: 7px;
  display: flex;
  align-items: center;
}

.privacy-checkbox {
  margin-right: 10px;
}

.privacy-label {
  font-size: 14px;
  color: #333;
}

.privacy-link {
  color: #118b5e;
  text-decoration: none;
  cursor: pointer;
}

.privacy-link:hover {
  text-decoration: underline;
}

.message {
  margin: 2px 0;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  font-weight: bold;
}

.success-message {
  font-size: 13px;
  color: #00C851;
  background-color: #e8f5e9;
  border: 1px solid #00C851;
}
.error-message {
  font-size: 13px;
  color: #ff4444;
  background-color: #ffebee;
  border: 1px solid #ff4444;
}



@keyframes flash {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.error-message {
  animation: flash 1.5s infinite;
}

/* Modal Styles */
.modal-overlay {
position: fixed;
top: 0; left: 0; right: 0; bottom: 0;
background-color: rgba(0, 0, 0, 0.4);
display: flex;
justify-content: center;
align-items: center;
z-index: 1000;
animation: modalFadeIn 0.4s;
padding: 10px;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
background: #f4fdfb;
border-radius: 14px;
width: 90%;
max-width: 680px;
max-height: 75vh;
overflow-y: auto;
box-shadow: 0 8px 32px rgba(79, 122, 107, 0.2);
border: 1.5px solid #b9dcd2;
font-size: 0.85rem;
line-height: 1.5;
animation: modalScaleIn 0.3s;
}

@keyframes modalScaleIn {
  from { transform: scale(0.96); }
  to { transform: scale(1); }
}

.modal-header {
background: linear-gradient(90deg, #d9ede6, #eaf5f1);
color: #44695c;
font-size: 1.1rem;
padding: 0px 20px;
border-bottom: 2px solid #6a9c89;
display: flex;
justify-content: space-between;
align-items: center;
border-radius: 14px 14px 0 0;
}

.modal-column {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 0.75rem;
}

.policy-section {
background: #edf8f5;
padding: 12px;
border: 2px solid #b8dcd0;
border-radius: 6px;
}

h2, h3 {
color: #44695c;
}

h4 {
color: #44695c;
font-size: 0.95rem;
margin-bottom: 6px;
}
.modal-content {
padding: 20px;
background: #f8fbfa;
border-radius: 0 0 12px 12px;
}

.modal-footer {
padding: 14px 20px;
border-top: 1px solid #d8eae5;
text-align: right;
background: #f1f9f7;
border-radius: 0 0 14px 14px;
}

.modal-close-btn {
background: linear-gradient(135deg, #cbefe4, #b8e5d7);
border: none;
font-size: 1em;
cursor: pointer;
color: #44695c;
padding: 8px 16px;
border-radius: 8px;
transition: background 0.3s, color 0.3s, transform 0.2s;
box-shadow: 0 2px 6px rgba(0, 0, 0, 0.236);
}

.modal-close-btn:hover {
background: linear-gradient(135deg, #a3c5b8, #8bbcae);
color: white;
transform: scale(1.03);
}

  
  .register-bg {
  background-image: url("/circle.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  }

  .container {
      width: 100%;
      max-width: 1100px;
      display: flex;
      justify-content: center;
      align-items: center;
  }
  
  .login-container {
  width: 100%;
  max-width: 650px;
  min-width: 300px;
  max-height: 620px;
  min-height: 600px;
  background: rgba(255, 255, 255, 0.92); /* Crisp white with slight transparency */
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  padding: 15px;
  gap: 15px;
  box-sizing: border-box;
  
  /* Soft 3D shadow effect (floating panel) */
  box-shadow:
      6px 6px 12px rgba(0, 0, 0, 0.08),    /* Bottom-right shadow */
      6px 6px 12px rgba(0, 0, 0, 0.08),     /* Inner bottom-right shadow */
      6px 6px 12px rgba(0, 0, 0, 0.08),  
      6px 6px 12px rgba(0, 0, 0, 0.08),  ; 
  border: 1px solid rgba(255, 255, 255, 0.3); /* Subtle border for depth */
  transition: all 0.3s ease;
  position: relative;
}    
  .login-form {
      width: 50%;
      display: flex;
      flex-direction: column;
      text-align: center;
      align-items: center;
      padding: 2px 10px;
  }
  
  .login-form-items {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 99%;
      
  }
  
  span.login-label {
  color: #2d2d2d; 
  font-weight: 900;
  font-size: 35px;
  letter-spacing: 2px;
  margin-bottom: 10px;
  white-space: nowrap;
  font-family: 'Segoe UI', 'Gill Sans', 'Helvetica Neue', sans-serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05); /* very subtle depth */
}

  
  .text-input-container {
      width: 95%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      align-items: center;
  }
  
  .text-input-container input {
      width: 100%;
      padding: 4px;
      font-size: 14px;
      margin-bottom: 10px;
  }
  
  input.text-style {
  border-radius: 10px;
  width: 95%;
  max-width: 280px;
  min-width: 150px;
  height: 10px;
  padding: 8px 12px 9px;
  margin-bottom: 0;
  font-size: 14px;
  background: none;
  border: 2px solid #6b6b6b; /* softer dark gray */
  color: #333;
  font-family: 'Segoe UI', sans-serif;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input.text-style:focus,
input.text-style:hover {
  border-color: #4f7a6b; /* greenish tone to match theme */
  box-shadow: 0 0 5px rgba(79, 122, 107, 0.4); /* subtle glow */
  outline: none;
}

  
  
input.text-style1 {
  border-radius: 10px;
  width: 95%;
  max-width: 280px;
  min-width: 150px;
  height: 10px;
  padding: 9px 12px 9px;
  margin-bottom: 3px;
  font-size: 14px;
  background: none;
  border: 2px solid #6b6b6b; /* softer dark gray */
  color: #333;
  font-family: 'Segoe UI', sans-serif;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input.text-style1:focus,
input.text-style1:hover {
  border-color: #4f7a6b; /* greenish tone to match theme */
  box-shadow: 0 0 5px rgba(79, 122, 107, 0.4); /* subtle glow */
  outline: none;
}

  input:focus {
      outline: none;
  }
  
  .form-label {
      color: black;
      font-weight: 350;
      font-size: 14px;
      margin: 3px 0 3px;
  }
  
  button.login-btn,
.login-btn1 {
  width: 100%;
  max-width: 250px;
  min-width: 160px;
  background: linear-gradient(135deg, #a8d0c2, #62a293, #a8d0c2);
  border-radius: 20px;
  border: none;
  padding: 7px 0;
  color: #f9faf7;
  font-weight: 700;
  font-size: 14px;
  font-family: sans-serif;
  letter-spacing: 2px;
  margin-top: 8px;
  cursor: pointer;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.397); 
  text-align: center;
  text-decoration: none;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

button.login-btn:hover,
.login-btn1:hover {
  background: linear-gradient(135deg, #d9f0e7, #9bd2c2, #d9f0e7);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  color: #2d2d2d; 
}


  .success {
      color: green;
  }
  
  .invalid {
      color: red;
      font-size: 0.9em;
  }
  
  .login-deco-container {
width: 50%;
background: linear-gradient(135deg, #b8e4d7, #9ecfbc, #84b9a4);
backdrop-filter: blur(12px);
border-radius: 20px;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 20px;
box-sizing: border-box;
box-shadow: 0 8px 30px rgba(100, 155, 135, 0.25);
border: 1px solid rgba(255, 255, 255, 0.15);
}
  
  .login-deco {
      position: relative;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
  }
  
.deco-image {
    width: 100%;
    max-width: 300px;
    height: auto;
    margin-top: 100px;
    filter: drop-shadow(0 10px 20px rgba(50, 120, 70, 0.15));
  transition: transform 0.3s ease;
  z-index: 2;
  position: relative;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
0%, 100% {
  transform: translateY(0px);
}
50% {
  transform: translateY(-10px);
}
}
  
  .penny {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      color: #f7faf9;
      font-weight: bold;
      font-size: 50px;
      letter-spacing: 2px;
      padding-top: 10px;
      text-align: center;
      font-family: 'Segoe UI', 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.504); 
  }
  
  /* RESPONSIVE — Keep side-by-side, scale content */
  
  @media (max-width: 1024px) {
          .login-container {
              padding: 15px;
              gap: 10px;
          }
      
          .login-form,
          .login-deco-container {
              width: 50%;
          }
  
          .text-input-container {
              width: 95%;
          }
      
          .deco-image {
              max-width: 260px;
              margin-top: 80px;
          }
      
          .penny {
              font-size: 45px;
          }
      
          span.login-label {
              font-size: 35px;
              margin-bottom: 10px;
          }
      }
      
      @media (max-width: 768px) {
          .login-form-items{
              width: 100%;
          }
      
          .login-form,
          .login-deco-container {
              width: 50%;
          }
          .form-label {
              font-size: 14px;
          }
      
          .deco-image {
              max-width: 220px;
          }
  
          .text-input-container {
              width: 100%;
          }
          .about-link {
              margin-top: 13px;
              font-size: 13px;
          }
      
          .penny {
              font-size: 38px;
          }
      
          span.login-label {
              font-size: 36px;
              margin-bottom: 10px;
          }
      
          button.login-btn,
          .login-btn1 {
              font-size: 14px;
              padding: 5px 0;
          }
          .password-hint {
              font-size: 11px;
          }
          .privacy-label {
              font-size: 11px;
          }
      }
      
      @media (max-width: 480px) {
          .login-form,
          .login-deco-container {
              width: 50%;
              padding: 10px;
          }
      
          .deco-image {
              max-width: 220px;
          }

           .text-input-container {
              width: 100%;
          }
      
          .penny {
              font-size: 25px;
          }
      
          span.login-label {
              font-size: 34px;
              margin-bottom: 10px;
          }
          .about-link {
              margin-top: 0;
              font-size: 12px;
          }
          .error-message,
          .success-message {
              font-size: 12px;
          }
          .modal-column{
              display: grid;
              grid-template-columns: 1fr;
          }
          .highlight-grid {
              display: grid;
              grid-template-columns: repeat(1, 1fr);
          }
      }
  </style>