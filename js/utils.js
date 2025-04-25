/**
 * Utility functions for the application
 */

const utils = {
  /**
   * Generate a unique ID with optional prefix
   * @param {string} prefix - Optional prefix for the ID
   * @returns {string} - The generated ID
   */
  generateId: (prefix = '') => {
    return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Format a date according to user preferences
   * @param {string|Date} date - Date to format
   * @param {string} format - Date format (from settings)
   * @returns {string} - Formatted date
   */
  formatDate: (date, format = 'MM/DD/YYYY') => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM/DD/YYYY':
      default:
        return `${month}/${day}/${year}`;
    }
  },

  /**
   * Format a time according to user preferences
   * @param {string|Date} time - Time to format
   * @param {string} format - Time format ('12' or '24')
   * @returns {string} - Formatted time
   */
  formatTime: (time, format = '12') => {
    if (!time) return '';
    
    const d = new Date(time);
    if (isNaN(d.getTime())) return '';
    
    if (format === '24') {
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } else {
      const hours = d.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = (hours % 12) || 12;
      return `${formattedHours}:${d.getMinutes().toString().padStart(2, '0')} ${ampm}`;
    }
  },

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   * @returns {string} - Formatted currency
   */
  formatCurrency: (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  /**
   * Capitalize the first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} - Capitalized string
   */
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Format a name (first name + last name)
   * @param {Object} person - Person object with firstName and lastName
   * @returns {string} - Formatted name
   */
  formatName: (person) => {
    if (!person) return '';
    return `${person.firstName} ${person.lastName}`;
  },

  /**
   * Calculate the difference in hours between two timestamps
   * @param {string|Date} start - Start time
   * @param {string|Date} end - End time
   * @returns {number} - Hours difference (to 2 decimal places)
   */
  calculateHours: (start, end) => {
    if (!start || !end) return 0;
    
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    
    if (isNaN(startTime) || isNaN(endTime) || startTime > endTime) return 0;
    
    const diffHours = (endTime - startTime) / (1000 * 60 * 60);
    return parseFloat(diffHours.toFixed(2));
  },

  /**
   * Get the current date in ISO format (YYYY-MM-DD)
   * @returns {string} - Today's date in ISO format
   */
  getTodayISO: () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Format a date in a human-readable format
   * @param {string|Date} date - Date to format
   * @returns {string} - Human-readable date
   */
  formatDateLong: (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Format a date relative to now (e.g., "2 days ago")
   * @param {string|Date} date - Date to format
   * @returns {string} - Relative date
   */
  formatRelativeDate: (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return utils.formatDate(date);
  },

  /**
   * Get start and end dates for a given time period
   * @param {string} period - Time period (e.g., 'thisWeek', 'thisMonth')
   * @returns {Object} - { startDate, endDate } in ISO format
   */
  getDateRange: (period) => {
    const today = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'thisWeek':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        endDate = new Date(today);
        endDate.setDate(startDate.getDate() + 6);
        break;
        
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
        
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
        
      case 'thisQuarter':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
        break;
        
      case 'thisYear':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
        
      default: // last 7 days
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        endDate = new Date(today);
        break;
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  },

  /**
   * Parse the query string parameters
   * @returns {Object} - Object containing the query parameters
   */
  getQueryParams: () => {
    const params = {};
    const queryString = window.location.search.substring(1);
    
    if (queryString) {
      const pairs = queryString.split('&');
      
      pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      });
    }
    
    return params;
  },

  /**
   * Validate an email address
   * @param {string} email - Email to validate
   * @returns {boolean} - Whether the email is valid
   */
  isValidEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Validate a phone number
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - Whether the phone number is valid
   */
  isValidPhone: (phone) => {
    const regex = /^[\d\+\-\(\) ]{7,20}$/;
    return regex.test(phone);
  },

  /**
   * Show a toast message
   * @param {string} message - Message to display
   * @param {string} type - Message type ('success', 'error', 'warning', 'info')
   * @param {number} duration - Duration in milliseconds
   */
  showToast: (message, type = 'success', duration = 3000) => {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    
    // Clear existing classes
    toast.classList.remove('success', 'error', 'warning', 'info');
    
    // Set message and type
    toastMessage.textContent = message;
    toast.classList.add(type);
    
    // Show toast with animation
    toast.classList.add('show');
    
    // Hide after duration
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  },

  /**
   * Download data as JSON file
   * @param {Object} data - Data to download
   * @param {string} filename - Filename
   */
  downloadJSON: (data, filename) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },

  /**
   * Toggle the loading overlay
   * @param {boolean} show - Whether to show or hide the overlay
   */
  toggleLoading: (show) => {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
      overlay.classList.add('show');
    } else {
      overlay.classList.remove('show');
    }
  },

  /**
   * Throttle a function to limit how often it can be called
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} - Throttled function
   */
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Debounce a function to delay its execution
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} - Debounced function
   */
  debounce: (func, delay) => {
    let timeoutId;
    return function() {
      const args = arguments;
      const context = this;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(context, args), delay);
    };
  }
};