/**
 * Authentication Service
 * 
 * Handles user authentication and authorization.
 */

class AuthService {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  /**
   * Initialize the auth service
   */
  init() {
    // Check if user is already logged in
    const userData = localStorage.getItem('staffTrack_currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
    
    // For demo purposes, if no user is logged in, create a demo admin
    if (!this.currentUser) {
      this.currentUser = {
        id: 'admin-001',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'admin',
        imageUrl: 'https://i.pravatar.cc/150?img=1'
      };
      
      localStorage.setItem('staffTrack_currentUser', JSON.stringify(this.currentUser));
    }
  }

  /**
   * Get the current user
   * @returns {Object|null} - Current user or null if not logged in
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if a user is logged in
   * @returns {boolean} - Whether a user is logged in
   */
  isLoggedIn() {
    return !!this.currentUser;
  }

  /**
   * Check if the current user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean} - Whether the user has the role
   */
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Logged in user
   */
  login(email, password) {
    // For demo purposes, we'll accept any login
    // In a real application, this would validate credentials against a server
    
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        if (!email || !password) {
          reject(new Error('Email and password are required'));
          return;
        }
        
        // For demo, create an admin user
        this.currentUser = {
          id: 'admin-001',
          firstName: 'Admin',
          lastName: 'User',
          email: email,
          role: 'admin',
          imageUrl: 'https://i.pravatar.cc/150?img=1'
        };
        
        localStorage.setItem('staffTrack_currentUser', JSON.stringify(this.currentUser));
        
        resolve(this.currentUser);
      }, 1000);
    });
  }

  /**
   * Login as an employee
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} - Logged in employee
   */
  loginAsEmployee(employeeId) {
    return new Promise((resolve, reject) => {
      // Get employee from storage
      const employee = storageService.getById('employees', employeeId);
      
      if (!employee) {
        reject(new Error('Employee not found'));
        return;
      }
      
      // Set as current user with employee role
      this.currentUser = {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: 'employee',
        imageUrl: employee.imageUrl || 'https://i.pravatar.cc/150?img=20'
      };
      
      localStorage.setItem('staffTrack_currentUser', JSON.stringify(this.currentUser));
      
      resolve(this.currentUser);
    });
  }

  /**
   * Logout the current user
   * @returns {Promise<void>}
   */
  logout() {
    return new Promise((resolve) => {
      this.currentUser = null;
      localStorage.removeItem('staffTrack_currentUser');
      resolve();
    });
  }

  /**
   * Register a new user (for demo purposes)
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user
   */
  register(userData) {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        if (!userData.email || !userData.password) {
          reject(new Error('Email and password are required'));
          return;
        }
        
        // Create user
        const newUser = {
          id: utils.generateId('user-'),
          firstName: userData.firstName || 'New',
          lastName: userData.lastName || 'User',
          email: userData.email,
          role: 'admin',
          imageUrl: userData.imageUrl || 'https://i.pravatar.cc/150?img=30',
          createdAt: new Date().toISOString()
        };
        
        // Log in as the new user
        this.currentUser = newUser;
        localStorage.setItem('staffTrack_currentUser', JSON.stringify(this.currentUser));
        
        resolve(newUser);
      }, 1000);
    });
  }
}

// Create and export the auth service singleton
const authService = new AuthService();