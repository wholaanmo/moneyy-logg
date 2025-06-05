<template>
  <div class="bg">

     <!-- Navbar -->
     <nav class="navbar">
      <div class="navbar-container">
        <ul class="nav-menu">
          <li class="nav-item">
            <a href="#" @click.prevent="scrollTo('container')" class="nav-link">Home</a>
          </li>
          <li class="nav-item">
            <a href="#" @click.prevent="scrollTo('personal')" class="nav-link">Personal Expense</a>
          </li>
          <li class="nav-item">
            <a href="#" @click.prevent="scrollTo('group')" class="nav-link">Group Expense</a>
          </li>
          <li class="nav-item">
            <a href="#" @click.prevent="scrollTo('register-container')" class="nav-link">Login</a>
          </li>
        </ul>
      </div>
    </nav>

  <div class="container" ref="container">
    <div class="hero-graphic">
      <img src="/LOGO.png" alt="Money Log Logo" class="logo" />
      <div class="graphic-accent"></div>
    </div>

    <div class="content">
      <h2>💰
    Track with ease,<br />
    <span class="highlight">spend with peace!</span></h2>
      <p class="description">
        Money Log is a budget tracker website focused on helping users manage and track their expenses. 
        This program allows users to record their expenses, categorize transactions, and follow their 
        financial budget over time.
      </p>
      </div>
  </div>

  <div class="personal" ref="personal">
  <div class="personal-container">
    <!-- Left side (60%) with feature cards -->
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon"><i class="fas fa-chart-line"></i></div>
        <h3>Smart Budgeting</h3>
        <p>Add and edit your personal budget. Get notified instantly when your spending goes over the limit.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon1"><i class="fas fa-clipboard-list icon clipboard-icon"></i></div>
        <h3>Expense Management</h3>
        <p>Easily manage your expenses by adding, editing, or deleting entries.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon2"><i class="fas fa-microphone"></i></div>
        <h3>Voice Recognition</h3>
        <p>Use voice recognition to quickly add new expenses without typing.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon3"><i class="fas fa-camera"></i></div>
        <h3>Capture Every Transaction</h3>
        <p>Upload photos of your receipts to keep a visual record of each transaction.</p>
      </div>

    <div class="feature-card">
        <div class="feature-icon4"><i class="fas fa-bell"></i></div>
        <h3> Smart Notification</h3>
        <p>Stay alert with notifications when your expenses exceed your budget.</p>
      </div>

    <div class="feature-card">
        <div class="feature-icon5"><i class="fas fa-calendar-alt icon calendar-icon"></i></div>
        <h3>Filtered Expense History</h3>
        <p>View your expenses by month, year, or category and download your filtered expense data.</p>
      </div>
    </div>
    
    <!-- Right side (40%) with image and header -->
    <div class="personal-image-section">
      <h3 class="section-header">Personal Expense Tracker Features </h3>
      <img src="/personal.png" alt="Personal Expense Tracker" class="personal-image" />
    </div>
  </div>
</div>

<div class="group" ref="group">
  <div class="group-container">
    <!-- Left side (40%) with image and header -->
    <div class="group-image-section">
      <h3 class="section-header">Group Expense Tracker Features</h3>
      <img src="/group.png" alt="Group Expense Tracker" class="group-image" />
    </div>
    
    <!-- Right side (60%) with feature cards -->
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon5"><i class="fas fa-users"></i></div>
        <h3>Create or Join Groups</h3>
        <p>Start your own group or join an existing one using a group code or an invitation sent via email.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon4"><i class="fas fa-user-shield"></i></div>
        <h3>Admin Controls</h3>
        <p>Admins can rename the group, manage members by removing or blocking them, update the group budget, or even delete the group.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon3"><i class="fas fa-clipboard-list icon clipboard-icon"></i></div>
        <h3>Shared Expense Management</h3>
        <p>All members can add, edit, or delete group expenses. Expenses can also be recorded using voice recognition.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon2"><i class="fas fa-file-image"></i></div>
        <h3>Capture Every Transaction</h3>
        <p>Upload, edit, or delete receipt photos for group expenses. </p>
      </div>

      <div class="feature-card">
        <div class="feature-icon1"><i class="fas fa-hand-holding-usd"></i></div>
        <h3>Expense Splitting & Contributions</h3>
        <p>Split expenses fairly and track each member’s payments, showing who’s paid, pending, or owes balance.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon"><i class="fas fa-file-download"></i></div>
        <h3>Reports & Notifications</h3>
        <p>Download budget summaries, category breakdowns, member contributions, and full expense details anytime.</p>
      </div>
    </div>
  </div>
</div>

<div class="split-container" ref="register-container">
  <div class="register-container">
    <div class="register-card">
      <h3>Ready to take control of your finances?</h3>
      <p>Join thousands of users who are managing their money smarter</p>
      <router-link to="/register" class="register-button">
        Get Started - It's Free
      </router-link>
      <div class="login-prompt">
        Already have an account? <router-link to="/login">Log in</router-link>
      </div>
    </div>
  </div>
  <div class="image-container">
    <img src="/register.png" alt="Financial management illustration">
  </div>
</div>

          <div v-if="accountDeleted" class="deletion-popup">
  <h3><i class="fas fa-check-circle"></i> Account Successfully Deleted</h3>
  <p>We're sorry to see you go. You can always create a new account if you change your mind.</p>
  <button class="ok-button" @click="accountDeleted = false">
    <i class="fas fa-thumbs-up"></i> OK
  </button>
</div>
</div>

</template>



<script scoped>
import Navigation from "./navigation.vue";
 
export default {
  components: { Navigation },
  data() {
    return {
      userInfo: null,
      error: null,
      accountDeleted: false
    };
  },

  methods: {
    scrollTo(refName) {
    const element = this.$refs[refName];
    if (element) {
      // Add offset for navbar height
      const offset = 70; // Match your navbar height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  }
},

  mounted() {
    
    if (this.$route.query.deleted) {
      this.accountDeleted = true;
      return;
    }
    
    // Only fetch user data if logged in
    const token = localStorage.getItem('jsontoken');
    if (!token) return;

    fetch('http://localhost:3000/api/users/', {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    })
    .then(res => {
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    })
    .then(data => {
      this.userInfo = data;
    })
    .catch(err => {
      console.error("API Error:", err);
      this.error = "Failed to load user data";
    });
  }
};
</script>


<style>
body {
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 0;
  width: 100%;
  background-color: rgb(250, 254, 255);
  overflow-x: hidden;
  overflow-y: auto;
}
</style>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center; /* Center the navbar content */
  left: 0;
  right: 0;
  transition: all 0.3s ease;
}

.navbar-container {
  display: flex;
  justify-content: center; /* Center the nav items */
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  width: 100%;
}

.nav-menu {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
  justify-content: center; /* Center the menu items */
  width: 100%;
}

.nav-item {
  position: relative;
}

.nav-link {
  color: #2d3748;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.2px;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(to right, #4CB5AB, #88C9BF);
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: 	#4CB5AB;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link.active {
  color: 	#4CB5AB;
  font-weight: 600;
}

.nav-link.active::after {
  width: 100%;
}


.deletion-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #cde5dc, #a6cfc1, #88b8a5);
  border: 1px solid #a5d6a7;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 15px 30px 35px 30px;
  width: 90%;
  max-width: 450px;
  border-radius: 16px;
  text-align: center;
  z-index: 1000;
  font-family: 'Segoe UI', sans-serif;
  animation: fadeIn 0.4s ease-out;
}

.deletion-popup h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  color: #ffffff;
}

.deletion-popup p {
  color: #f0f7f5;
  font-size: 1rem;
  margin-bottom: 25px;
}

.ok-button {
  padding: 10px 24px;
  background-color: #355f52; /* darker tone for contrast */
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ok-button:hover {
  background-color: #2a4d44;
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.split-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.register-container {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin-bottom: 80px;
}

.image-container {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px; 
}
.register-card {
  background: rgba(255, 255, 255, 0.75);
  border-radius: 24px;
  padding: 15px 35px;
  box-shadow: 0 15px 35px rgba(60, 120, 80, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}

.register-card::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at top left, #c8e6c9 0%, transparent 70%);
  opacity: 0.15;
  z-index: 0;
  pointer-events: none;
}

.register-card:hover {
  box-shadow: 0 20px 45px rgba(50, 120, 70, 0.25);
  transform: translateY(-5px) scale(1.01);
}

.register-card h2 {
  font-size: 2rem;
  margin-bottom: 16px;
  color: #2e7d32;
  font-weight: 800;
  position: relative;
  z-index: 1;
}

.register-card p {
  font-size: 1.05rem;
  color: #556b60;
  margin-bottom: 30px;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

.register-button {
  display: inline-block;
  background: linear-gradient(135deg, #4CB5AB, #2a4b3c);
  color: white;
  padding: 14px 40px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
  transition: all 0.4s ease;
  box-shadow: 0 8px 20px rgba(46, 125, 50, 0.25);
  background-size: 200% 200%;
  background-position: left center;
  position: relative;
  overflow: hidden;
}

.register-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.15);
  transform: skewX(-20deg);
  transition: all 0.6s ease;
}

.register-button:hover {
  transform: translateY(-4px);
  background-position: right center;
  box-shadow: 0 10px 28px rgba(46, 125, 50, 0.35);
}

.register-button:hover::before {
  left: 120%;
}


.login-prompt {
  font-size: 0.95em;
  color: #546e60;
  margin-top: 20px;
}


.bg {
  background: linear-gradient(135deg, #e0f7fa, #fce4ec);
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
  overflow-x: hidden;
  overflow-y: hidden;
  min-height: 200vh;
}

.bg::before,
.bg::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  opacity: 0.2;
  z-index: 0;
}

.bg::before {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle at center, #81c784, #4caf50);
  top: -100px;
  left: -100px;
}

.bg::after {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle at center, #ffd54f, #ffb74d);
  bottom: -150px;
  right: -150px;
}

.container,
.personal, 
.group,
.image-container,
.register-container {
  position: relative;
  z-index: 1; /* Makes sure content stays above background shapes */
}

.group {
  margin: 40px auto; /* Reduced side margins to 0 */
  max-width: 1200px; /* Slightly increased max-width */
  padding: 0 15px; /* Reduced side padding */
  width: 100%;
}

.group-container {
  display: flex;
  gap: 30px;
  width: 90%;
  margin: 0 auto;  /* centers the container horizontally */
  justify-content: center; /* centers flex items inside the container */
}

.group-image {
  width: 95%;
  height: auto;
  border-radius: 16px;
  backdrop-filter: blur(6px);
  background-color: rgba(255, 255, 255, 0.1);
  padding: 6px;
  box-shadow:
    0 8px 16px rgba(42, 75, 60, 0.2),
    0 4px 8px rgba(106, 156, 137, 0.12),
    0 0 12px rgba(139, 188, 174, 0.25); /* glow highlight */

  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.group-image:hover {
  transform: scale(1.03) translateY(-4px);
  box-shadow:
    0 12px 24px rgba(42, 75, 60, 0.25),
    0 6px 12px rgba(106, 156, 137, 0.18),
    0 0 20px rgba(139, 188, 174, 0.35);
}


.personal {
  margin: 40px auto; /* Reduced side margins to 0 */
  max-width: 1200px; /* Slightly increased max-width */
  padding: 0 15px; /* Reduced side padding */
  width: 100%;
}

.group-image-section {
  flex: 0 0 38%; /* Slightly reduced from 40% */
  padding: 0 10px; 
  display: flex;
  flex-direction: column;
  align-items: center;
}

.personal-container {
  display: flex;
  gap: 30px;
  width: 90%;
  margin: 0 auto;  /* centers the container horizontally */
  justify-content: center; /* centers flex items inside the container */
}

.features-grid {
  flex: 0 0 62%; /* Slightly increased from 60% */
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px; /* Reduced gap between cards */
  padding: 0 10px; /* Added internal padding */
}


.personal-image-section {
  flex: 0 0 38%; /* Slightly reduced from 40% */
  padding: 0 10px; 
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-header {
  font-size: 2.2rem;
  color: #2a4b3c;
  margin-bottom: 28px;
  text-align: center;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 1.2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: all 0.3s ease;
}


/* Optional hover effect for subtle interaction */
.section-header:hover {
  color: #3d6651;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
}

.section-header:hover::after {
  background: #6a9c89;
}


.personal-image {
  width: 95%;
  height: auto;
  border-radius: 16px;
  backdrop-filter: blur(6px);
  background-color: rgba(255, 255, 255, 0.1);
  padding: 6px;
  box-shadow:
    0 8px 16px rgba(42, 75, 60, 0.2),
    0 4px 8px rgba(106, 156, 137, 0.12),
    0 0 12px rgba(139, 188, 174, 0.25); /* glow highlight */

  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.personal-image:hover {
  transform: scale(1.03) translateY(-4px);
  box-shadow:
    0 12px 24px rgba(42, 75, 60, 0.25),
    0 6px 12px rgba(106, 156, 137, 0.18),
    0 0 20px rgba(139, 188, 174, 0.35);
}


.feature-card {
  background: white;
  border-radius: 16px;
  padding: 20px; /* Reduced padding */
  transition: all 0.3s ease;
  border-bottom: 6px solid #85A98F;
  box-shadow: 0 4px 12px rgba(50, 120, 70, 0.08);
  max-height: 200px; /* Smaller fixed height */
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(50, 120, 70, 0.12);
}

.feature-icon {
  font-size: 2rem; /* Smaller icon */
  margin-bottom: 5px;
  background: linear-gradient(135deg, #e8f5e9, #a5d6a7);
  width: 60px; /* Smaller circle */
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(70, 180, 120, 0.2);
  align-self: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.feature-icon1 {
  font-size: 2rem; /* Smaller icon */
  margin-bottom: 5px;
  background: linear-gradient(135deg, #a8edea, #fed6e3); /* mint to soft pink */
  width: 60px; /* Smaller circle */
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(70, 180, 120, 0.2);
  align-self: center;
}

.feature-icon1:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.feature-icon2 {
  font-size: 2rem; /* Smaller icon */
  margin-bottom: 5px;
  background: linear-gradient(135deg, #ffe29f, #ffa99f); /* pastel yellow to peach */
  width: 60px; /* Smaller circle */
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(70, 180, 120, 0.2);
  align-self: center;
}

.feature-icon2:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
.feature-icon3 {
  font-size: 2rem; /* Smaller icon */
  margin-bottom: 5px;
  background: linear-gradient(135deg, #d4fc79, #96e6a1); /* light green to mint */
  width: 60px; /* Smaller circle */
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(70, 180, 120, 0.2);
  align-self: center;
}

.feature-icon3:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.feature-icon4 {
  font-size: 2rem; /* Smaller icon */
  margin-bottom: 5px;
  background: linear-gradient(135deg, #fff1a6, #fcd374); /* mint to soft blue */
  width: 60px; /* Smaller circle */
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(70, 180, 120, 0.2);
  align-self: center;
}

.feature-icon4:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
.feature-icon5 {
  font-size: 2rem; /* Smaller icon */
  margin-bottom: 5px;
  background: linear-gradient(135deg, #dec8f3, #7b60bb);
  width: 60px; /* Smaller circle */
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(70, 180, 120, 0.2);
  align-self: center;
}

.feature-icon5:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
.feature-card h3 {
  font-size: 1rem; /* Smaller heading */
  color: #2a4b3c;
  margin-bottom: 10px;
  font-weight: 600;
  text-align: center;
}

.feature-card p {
  font-size: 0.8rem; /* Smaller text */
  color: #5a6e65;
  line-height: 1.5;
  margin: 0;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .group-container {
    flex-direction: column;
  }

  
  .group-image-section,
  .features-grid {
    flex: 0 0 100%;
    width: 100%;
  }
  
  .group-image-section {
    order: 1;
    margin-bottom: 30px;
  }
}

@media (max-width: 900px) {
  .personal-container {
    flex-direction: column;
  }
  
  .features-grid,
  .personal-image-section {
    flex: 0 0 100%;
    width: 100%;
  }
  
  .features-grid {
    order: 2; /* Moves features below image on mobile */
  }
  
  .personal-image-section {
    order: 1; /* Moves image above features on mobile */
    margin-bottom: 30px;
  }
}

@media (max-width: 600px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    font-size: 1.5rem;
  }
}

@media (max-width: 600px) {
  .personal {
    grid-template-columns: 1fr; /* 1 column on mobile */
    gap: 15px;
  }
  
  .group {
    grid-template-columns: 1fr; /* 1 column on mobile */
    gap: 15px;
  }
  .feature-card {
    min-height: auto;
    padding: 20px;
  }
}


.container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 5%;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  margin-top: 10px;
  position: relative;
  box-shadow: 0 10px 40px rgba(60, 120, 80, 0.15);
}

.hero-graphic {
  flex: 1;
  text-align: center;
}

.logo {
  width: 95%;
  height: auto;
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

.logo:hover {
  transform: translateY(-5px);
}

.graphic-accent {
  position: absolute;
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(100, 200, 150, 0.1) 0%, rgba(255,255,255,0) 70%);
  top: -10%;
  left: -10%;
  z-index: 1;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  animation: float 8s ease-in-out infinite;
}

.content {
  width: 50%;
  padding: 30px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(50, 120, 70, 0.12);
  backdrop-filter: blur(12px);
  transition: all 0.4s ease;
  position: relative;
}

.content:hover {
  transform: translateY(-6px);
  box-shadow: 0 25px 40px rgba(50, 120, 70, 0.2);
}


h2 {
  font-size: 2.6rem;
  font-weight: 700;
  color: #1b5e20;
  margin-bottom: 1.5rem;
  line-height: 1.3;
  position: relative;
  letter-spacing: -0.5px;
  padding-left: 16px;
  border-left: 6px solid #81c784;
  animation: fadeSlideIn 0.6s ease;
  text-shadow: 0 1px 0 #ffffff, 0 2px 4px rgba(0,0,0,0.06);
}


.highlight {
  color: #2e7d32;
  position: relative;
  padding: 2px 8px;
  border-radius: 8px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  font-weight: 700;
  transition: all 0.4s ease;
}

.highlight::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 2px;
  width: 100%;
  height: 5px;
  z-index: -1;
  border-radius: 4px;
  opacity: 0.4;
}

.highlight:hover {
  background: linear-gradient(90deg, rgba(76,175,80,0.2), rgba(165,214,167,0.3));
  box-shadow: 0 0 6px rgba(76,175,80,0.3);
}

.description {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #3e564d;
  margin-bottom: 2rem;
  max-width: 90%;
  background-color: rgba(255, 255, 255, 0.45);
  border-left: 4px solid #c8e6c9;
  border-radius: 12px;
  padding: 16px 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.35s ease;
}

.description::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(165, 214, 167, 0.2), transparent);
  z-index: 0;
  transition: all 0.5s ease;
}

.description:hover::before {
  left: 0;
}

.description:hover {
  background-color: rgba(245, 255, 245, 0.75);
  box-shadow: 0 4px 15px rgba(76,175,80,0.1);
}

/* Subtle floating icon effect */
@keyframes floatIcon {
  0% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0); }
}



/* RESPONSIVE DESIGN */
@media only screen and (max-width: 1024px) {
  .container {
    flex-direction: column;
    padding: 40px 5%;
  }
  
  .hero-graphic, .content {
    width: 100%;
    max-width: 600px;
  }
  
  .hero-graphic {
    margin-bottom: 40px;
  }
  
  h2 {
    font-size: 2.2rem;
    text-align: center;
  }
  
  .highlight::after {
    bottom: 2px;
    height: 6px;
  }
}

@media only screen and (max-width: 768px) {
  h2 {
    font-size: 1.8rem;
  }
  
  .description {
    font-size: 1rem;
  }
  
  .content {
    padding: 30px;
  }
}

@media only screen and (max-width: 480px) {
  h2 {
    font-size: 1.6rem;
  }
  
  .feature-pill {
    display: block;
    margin-right: 0;
    text-align: center;
  }
  
  .graphic-accent {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
}
</style>