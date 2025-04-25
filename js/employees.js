/**
 * Employee Service
 * 
 * Handles all employee-related operations.
 */

class EmployeeService {
  constructor() {
    this.storageKey = 'employees';
  }

  /**
   * Get all employees
   * @returns {Array} - All employees
   */
  getAllEmployees() {
    return storageService.getAll(this.storageKey);
  }

  /**
   * Get an employee by ID
   * @param {string} id - Employee ID
   * @returns {Object|null} - Employee or null if not found
   */
  getEmployeeById(id) {
    return storageService.getById(this.storageKey, id);
  }

  /**
   * Create a new employee
   * @param {Object} employeeData - Employee data
   * @returns {Object} - Created employee
   */
  createEmployee(employeeData) {
    const newEmployee = {
      id: utils.generateId('emp-'),
      ...employeeData,
      createdAt: new Date().toISOString()
    };
    
    const result = storageService.add(this.storageKey, newEmployee);
    
    // Add to activity log
    this.logActivity({
      type: 'employee_added',
      description: `${newEmployee.firstName} ${newEmployee.lastName} was added to the system`,
      entityId: newEmployee.id
    });
    
    return result;
  }

  /**
   * Update an employee
   * @param {string} id - Employee ID
   * @param {Object} updates - Properties to update
   * @returns {Object|null} - Updated employee or null if not found
   */
  updateEmployee(id, updates) {
    const result = storageService.update(this.storageKey, id, updates);
    
    if (result) {
      // Add to activity log
      this.logActivity({
        type: 'employee_updated',
        description: `${result.firstName} ${result.lastName}'s profile was updated`,
        entityId: result.id
      });
    }
    
    return result;
  }

  /**
   * Delete an employee
   * @param {string} id - Employee ID
   * @returns {boolean} - Whether the employee was deleted
   */
  deleteEmployee(id) {
    const employee = this.getEmployeeById(id);
    if (!employee) return false;
    
    const result = storageService.remove(this.storageKey, id);
    
    if (result) {
      // Add to activity log
      this.logActivity({
        type: 'employee_deleted',
        description: `${employee.firstName} ${employee.lastName} was removed from the system`,
        entityId: id
      });
    }
    
    return result;
  }

  /**
   * Search for employees
   * @param {Object} filters - Search filters
   * @returns {Array} - Matching employees
   */
  searchEmployees(filters = {}) {
    let employees = this.getAllEmployees();
    
    // Apply filters
    if (filters.query) {
      const query = filters.query.toLowerCase();
      employees = employees.filter(emp => 
        emp.firstName.toLowerCase().includes(query) ||
        emp.lastName.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.position.toLowerCase().includes(query)
      );
    }
    
    if (filters.department && filters.department !== 'all') {
      employees = employees.filter(emp => emp.department === filters.department);
    }
    
    if (filters.status && filters.status !== 'all') {
      employees = employees.filter(emp => emp.status === filters.status);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'nameAsc':
          employees.sort((a, b) => a.firstName.localeCompare(b.firstName));
          break;
        case 'nameDesc':
          employees.sort((a, b) => b.firstName.localeCompare(a.firstName));
          break;
        case 'salaryHigh':
          employees.sort((a, b) => b.salary - a.salary);
          break;
        case 'salaryLow':
          employees.sort((a, b) => a.salary - b.salary);
          break;
        case 'recent':
          employees.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          break;
      }
    }
    
    return employees;
  }

  /**
   * Get top performing employees
   * @param {number} limit - Number of employees to return
   * @returns {Array} - Top performing employees
   */
  getTopPerformers(limit = 5) {
    // In a real application, this would calculate performance based on metrics
    // For demo, we'll use a random "performance" score
    const employees = this.getAllEmployees();
    
    // Add random performance score
    const withScores = employees.map(emp => ({
      ...emp,
      performanceScore: Math.random() * 5
    }));
    
    // Sort by score and limit
    return withScores
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, limit);
  }

  /**
   * Get total salary expense
   * @returns {number} - Total salary
   */
  getTotalSalary() {
    const employees = this.getAllEmployees();
    return employees.reduce((total, emp) => total + (emp.salary || 0), 0);
  }

  /**
   * Get employees grouped by department
   * @returns {Object} - Employees by department
   */
  getEmployeesByDepartment() {
    const employees = this.getAllEmployees();
    const departments = {};
    
    employees.forEach(emp => {
      if (!departments[emp.department]) {
        departments[emp.department] = [];
      }
      departments[emp.department].push(emp);
    });
    
    return departments;
  }

  /**
   * Export employee data to JSON
   * @returns {Object} - Employee data
   */
  exportEmployeeData() {
    return this.getAllEmployees();
  }

  /**
   * Import employee data from JSON
   * @param {Array} data - Employee data
   * @returns {boolean} - Whether the import was successful
   */
  importEmployeeData(data) {
    try {
      // Validate data format
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format. Expected an array.');
      }
      
      // Replace existing employees
      localStorage.setItem(`staffTrack_${this.storageKey}`, JSON.stringify(data));
      
      // Log activity
      this.logActivity({
        type: 'data_imported',
        description: `Employee data was imported (${data.length} records)`,
        entityId: 'import'
      });
      
      return true;
    } catch (error) {
      console.error('Error importing employee data:', error);
      return false;
    }
  }

  /**
   * Log an activity
   * @param {Object} activity - Activity data
   * @private
   */
  logActivity(activity) {
    const activityItem = {
      id: utils.generateId('act-'),
      ...activity,
      timestamp: new Date().toISOString()
    };
    
    storageService.add('activity', activityItem);
  }
}

// Create and export the employee service singleton
const employeeService = new EmployeeService();