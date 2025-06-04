<template>
  <header :class="{ 'scrolled-nav': scrolledNav }">
    <nav>
      <div class="branding">
        <img src="/LOGO.png" alt="Money Log Logo" class="logo-img" />
      </div>

      <ul v-show="!mobile" class="navigation">
        <router-link to="/profile" class="profile-trigger" aria-label="Profile">
          <i class="fas fa-user-circle" style="font-size: 30px; cursor: pointer;"></i>
        </router-link>
        <div class="icon1" @click="toggleMobileNav">
  <i :class="['fas', 'fa-bars', { 'rotate-360': mobileNav }]"></i>
</div>
      </ul>
      
      <div class="icon" @click="toggleMobileNav" v-show="mobile">
        <i :class="['fas', 'fa-bars', { 'rotate-360': mobileNav }]"></i>
      </div>
      
      <transition name="mobile-nav">
        <ul v-show="mobileNav" class="dropdown-nav">
          <div class="branding-mobile">
            <img src="/LOGO.png" alt="Money Log Logo" />
          </div>
          <div class="drop">
            <li><router-link class="link" to="/personal"><i class="fas fa-coins"></i> PERSONAL</router-link></li>
            <li><router-link class="link" to="/GC"><i class="fas fa-user-friends"></i> GROUP</router-link></li>
            <li><router-link class="link" to="/view"><i class="fas fa-calendar-alt"></i> PERSONAL VIEW</router-link></li>
            <li><router-link class="link" to="/groupview"><i class="fas fa-chart-pie"></i> GROUP VIEW</router-link></li>  
            <li><router-link class="link" to="/profile"><i class="fas fa-user-circle"></i> PROFILE</router-link></li>  
            <li class="logout-item">
              <button class="logout-btn" @click="showLogoutModal = true">
                <i class="fas fa-sign-out-alt"></i> LOGOUT
              </button>  
            </li>
          </div>
        </ul>
      </transition>

      <!-- LOGOUT MODAL -->
      <div v-if="showLogoutModal" class="modal-backdrop1" @click.self="closeModal">
        <div class="modal-card logout-modal">
          <h3><i class="fas fa-sign-out-alt"></i> Log out?</h3>
          <p>Are you sure you want to log out?</p>
          <div class="btn-row">
            <button class="btn cancel" @click="closeModal">Cancel</button>
            <button class="btn confirm" @click="performLogout">Yes, log out</button>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
export default {
  name: "navigation",
  data() {
    return {
      scrolledNav: null,
      mobile: null,
      mobileNav: null,
      windowwidth: null,
      showLogoutModal: false
    };
  },
  created() {
    window.addEventListener('resize', this.checkScreen);
    this.checkScreen();
  },
  mounted() {
    window.addEventListener("scroll", this.updateScroll);
  },
  methods: {
    toggleMobileNav() {
      this.mobileNav = !this.mobileNav;
    },

    closeModal() {
      this.showLogoutModal = false;
    },

    performLogout() {
      const token = localStorage.getItem('jsontoken');
      
      this.$axios.post('http://localhost:3000/api/users/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
          localStorage.clear();
          sessionStorage.clear();
          this.$store.dispatch("logout");  
          this.showLogoutModal = false;
          this.$router.push("/login");
      })
      .catch(error => {
          console.error('Logout error:', error);
          // Still proceed with client-side cleanup
          localStorage.clear();
          sessionStorage.clear();
          this.$store.dispatch("logout");  
          this.showLogoutModal = false;
          this.$router.push("/login");
      });
    },

    updateScroll() {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        return;
      }
      this.scrolledNav = false;
    },

    checkScreen(){
      this.windowWidth = window.innerWidth;
      if (this.windowWidth <= 800) {
        this.mobile = true;
        return;
      }
      this.mobile = false;
      this.mobileNav = false;
      return;
    },
  },
};
</script>


<style scoped>
header {
  position: fixed;
  background: linear-gradient(135deg, #79b39d 25%, #598f79 60%, #41725f 90%);
  z-index: 99;
  width: 102%;
  transition: .5s ease all;
  height: 100px;
  margin-left: -10px;
  margin-top: -15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.logout-item {
  margin: 8px 0;
  padding: 15px 14px;
  border-radius: 10px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.logout-item:hover {
  background-color: #d4ede4;
  transform: translateX(4px);
  cursor: pointer;
}

.logout-btn {
  background: none;
  border: none;
  color: #26665e;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 18px;
  transition: color 0.3s ease;
  width: 100%;
  text-align: left;
  padding: 0;
  cursor: pointer;
}

.logout-btn:hover {
  color: #204e47;
}

.modal-backdrop1 {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6); /* slightly darker for better focus */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px); /* adds a subtle blur behind the modal */
  animation: fadeIn 0.3s ease-in-out;
}

.modal-card.logout-modal {
  background: linear-gradient(135deg, #a4e3c7, hsl(172, 31%, 53%));
  padding: 0.8rem 2rem 2rem 2rem; /* top right bottom left */
  border-radius: 1.25rem;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
  text-align: center;
  max-width: 380px;
  min-width: 180px;
  width: 90%;
  color: white;
  animation: popIn 0.4s ease-out;
  font-family: 'Segoe UI', sans-serif;
}

.modal-card.logout-modal h3 {
  font-size: 1.6rem;
  margin-bottom: 0.75rem;
  font-weight: 700;
  text-shadow: 2px 3px 6px #33333375;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.modal-card.logout-modal p {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  color: #f1f1f1;
}

.btn-row {
  display: flex;
  justify-content: space-evenly;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn.cancel {
  background: #dddddd;
  color: #333;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: 1px solid #959595;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn.cancel:hover {
  background: #b5b5b5;
}

.btn.confirm {
  background: linear-gradient(135deg, #6a9c89, #4f7a6b);
  color: white;
  border: 1px solid #598877;
  padding: 0.6rem 1.4rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.confirm:hover {
  background: linear-gradient(135deg, #8bbcae, #6a9c89);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Animation reuse */
@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.branding-mobile {
  display: flex;
  justify-content: center;
  margin-right: 10px;
  padding: 0px 0;
}

.branding-mobile img {
  width: 180px;
  height: auto;
}
nav {
font-family: 'Poppins', sans-serif;
position: relative;
display: flex;
flex-direction: row;
padding: 8px 0;
transition: .5s ease all;
width: 90%;
margin-left: 40px;

ul, 
.link {
font-weight: 500;
color: #fcffed;
list-style: none;
text-decoration: none;
}

.user {
font-weight: 500;
color: #fcffed;
list-style: none;
text-decoration: none;
}


.navigation li {
text-transform: uppercase;
padding: 14px;
margin-left: 15px;
}

.navigation .link {
  font-size: 16px;
  position: relative;
  transition: color 0.3s ease;
  color:  rgb(255, 255, 250);
  text-decoration: none;
  padding-bottom: 2px;
  font-weight: 500;
}
.navigation .link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 100%;
  background: #fcffed;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.navigation .link:hover {
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.6);
}

.navigation .link:hover::after {
  transform: scaleX(1);
}

.branding {
display: flex;
align-items: center;
}

.logo-img {
  height: 90px;
  width: auto;
  margin-top: 5px;
}

.navigation {
display: flex;
align-items: end;
flex: 1;
justify-content: flex-end;
gap: 10px;
padding: 0;
margin: 0;
list-style: none;
font-family: Arial, Helvetica, sans-serif;
}

.navigation li {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}


.link {
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.link i {
  margin-right: 8px;
}

.icon {
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  right: 50px;
  height: 100%;
  color: rgb(255, 255, 250);
  cursor: pointer;
  transition: 
    color 0.3s ease, 
    transform 0.3s ease, 
    text-shadow 0.3s ease;

  i {
    font-size: 24px;
    transition: inherit;
  }
}

.icon:hover {
  color: #ffffff;
  transform: scale(1.05);
  text-shadow: 
    0 0 4px #ffffff,
    0 0 6px #26665e;
}
.icon {
display: flex;
align-items: center;
position: absolute;
top: 0;
right: 50px;
height: 100%;
color: rgb(255, 255, 250);

i {
  cursor: pointer;
  font-size: 24px;
  transition: .8s ease all;
}
}

.icon2 {
  display: flex;
  align-items: center;
  position: absolute;
  text-decoration: none;
  top: 0;
  right: 90px;
  height: 100%;
  color: rgb(255, 255, 250);
  cursor: pointer;
  transition: 
    color 0.3s ease, 
    transform 0.3s ease, 
    text-shadow 0.3s ease;
}

.icon2 i {
  font-size: 24px;
  transition: inherit;
}

.icon2:hover {
  color: #ffffff;
  transform: scale(1.05);
  text-shadow: 
    0 0 4px #ffffff,
    0 0 6px #26665e;
}


.icon-active {
transform: rotate(180deg);
}

.drop {
  margin-top: 20px;
  margin-left: 0px;
}

.dropdown-nav {
  display: flex;
  flex-direction: column;
  position: fixed;
  width: 100%;
  max-width: 200px;
  height: 100vh;
  background: linear-gradient(180deg, #f9fffe, #e6efeb); /* keep your background */
  margin-top: 2px;
  left: 0;
  padding: 30px 15px;
  border-right: 1px solid #d2e3dc;
  box-shadow: 6px 0 16px rgba(0, 0, 0, 0.15);
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  font-family: 'Poppins', sans-serif;
  z-index: 1000; /* ensures it stays above other content */
  transition: box-shadow 0.3s ease;
}

/* List items */
.dropdown-nav li {
  margin: 8px 0;
  padding: 15px 14px;
  border-radius: 12px;
  transition: 
    background-color 0.3s ease, 
    transform 0.2s ease,
    box-shadow 0.3s ease;
}

/* Enhanced hover effect */
.dropdown-nav li:hover {
  background-color: #d4ede4;
  transform: translateX(6px);
  box-shadow: 2px 4px 10px rgba(38, 102, 94, 0.15); /* soft matching shadow */
  cursor: pointer;
}

/* Router link style */
.dropdown-nav .link {
  color: #26665e;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

/* Link hover with subtle glow */
.dropdown-nav .link:hover {
  color: #204e47;
  text-shadow: 0 0 6px rgba(38, 102, 94, 0.3);
}

/* Profile icon wrapper */
.dropdown-nav .user {
  margin-left: 5px;
  margin-top: 16px;
  font-weight: 600;
}

/* Icon itself */
.dropdown-nav .user i {
  color: #26665e;
  font-size: 28px;
  transition: color 0.3s ease, transform 0.2s ease, text-shadow 0.3s ease;
}

/* Profile icon hover with glow and scale */
.dropdown-nav .user:hover i {
  color: #204e47;
  transform: scale(1.15);
  text-shadow: 0 0 4px rgba(32, 78, 71, 0.4);
  cursor: pointer;
}

.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition:  1s ease all;
}

.mobile-nav-enter-from,
.mobile-nav-leave-to {
  transform: translateX(-250px);
}

.mobile-nav-enter-to{
  transform: translateX(0);
}
}

.scrolled-nav {
background-color: #000;
box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba (0, 0, 0, 0.6);

nav {
  padding: 18px 0;

  .branding {
    img {
      width: 40px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba (0, 0, 0, 0.6);
    }
  }
}
}

.icon i {
  transition: transform 0.5s ease;
}

.icon .rotate-360 {
  transform: rotate(360deg);
}
.icon1 i {
  transition: transform 0.5s ease;
}

.icon1 .rotate-360 {
  transform: rotate(360deg);
}
.icon1 { 
  font-size: 28px;
  color: rgb(255, 255, 250); 
  transition: 
    color 0.3s ease, 
    transform 0.3s ease, 
    text-shadow 0.3s ease;
  margin-left: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
  right: 0px;
  bottom: 30px;
  text-decoration: none;
  font-weight: 500;
}

.icon1:hover {
  color: #ffffff;
  transform: scale(1.05);
  text-shadow: 
    0 0 4px #ffffff,
    0 0 6px #26665e;
}

.profile-trigger { 
  font-size: 28px;
  color: rgb(255, 255, 250); 
  transition: 
    color 0.3s ease, 
    transform 0.3s ease, 
    text-shadow 0.3s ease;
  margin-left: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
  right: 0px;
  bottom: 30px;
  text-decoration: none;
  font-weight: 500;
}

.profile-trigger:hover {
  color: #ffffff;
  transform: scale(1.05);
  text-shadow: 
    0 0 4px #ffffff,
    0 0 6px #26665e;
}

.profile-overlay {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
display: flex;
justify-content: center;
align-items: center;
z-index: 1000;
}

@media (max-width: 480px) {
  .modal-card.logout-modal {
    width: 70%;
  }
}

</style>