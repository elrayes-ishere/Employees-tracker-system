/**
 * Main Application Entry Point
 * 
 * Initializes the application and coordinates all services.
 */

class App {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the application
   */
  initialize() {
    if (this.initialized) return;
    
    // Initialize services
    try {
      // Ensure storage is initialized
      if (!storageService.initialized) {
        storageService.initializeStorage();
      }
      
      // Initialize UI
      uiService.initialize();
      
      // Mark as initialized
      this.initialized = true;
      
      console.log('StaffTrack Employee Management System initialized successfully');
    } catch (error) {
      console.error('Error initializing application:', error);
    }
  }

  /**
   * Get application data
   * @returns {Object} - Application data
   */
  getData() {
    return {
      employees: employeeService.getAllEmployees(),
      attendance: attendanceService.getAllAttendance(),
      punishments: punishmentService.getAllPunishments(),
      settings: storageService.getSettings(),
      activity: storageService.getAll('activity')
    };
  }

  /**
   * Import data into the application
   * @param {Object} data - Data to import
   * @returns {boolean} - Whether import was successful
   */
  importData(data) {
    try {
      storageService.importData(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * Export application data
   * @returns {Object} - Exported data
   */
  exportData() {
    return storageService.exportData();
  }

  /**
   * Reset the application to its initial state
   */
  reset() {
    try {
      storageService.clearAll();
      window.location.reload();
    } catch (error) {
      console.error('Error resetting application:', error);
    }
  }
}

// Create app instance
const app = new App();

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.initialize();
});