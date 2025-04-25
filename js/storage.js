/**
 * Storage Service
 * 
 * Handles all data storage and retrieval operations.
 * Uses localStorage for persistence.
 */

class StorageService {
  constructor() {
    this.prefix = 'staffTrack_';
    this.initialized = false;
    this.initializeStorage();
  }

  /**
   * Initialize storage with default data if empty
   */
  initializeStorage() {
    if (this.initialized) return;

    if (!localStorage.getItem(`${this.prefix}initialized`)) {
      // Set up initial data structure
      const initialData = {
        employees: [],
        attendance: [],
        punishments: [],
        settings: {
          general: {
            language: 'en',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12',
            autoLogout: true
          },
          company: {
            name: 'Acme Corporation',
            email: 'contact@acmecorp.com',
            phone: '+1 (555) 123-4567',
            address: '123 Main St, Anytown, USA'
          },
          departments: [
            { id: 'engineering', name: 'Engineering' },
            { id: 'marketing', name: 'Marketing' },
            { id: 'sales', name: 'Sales' },
            { id: 'hr', name: 'Human Resources' },
            { id: 'finance', name: 'Finance' }
          ],
          salary: {
            defaultSalary: 5000,
            paymentDay: 1,
            currency: 'USD'
          },
          punishmentRules: [
            { id: 'late', name: 'Late Arrival', defaultAmount: 50 },
            { id: 'absence', name: 'Unauthorized Absence', defaultAmount: 200 },
            { id: 'performance', name: 'Poor Performance', defaultAmount: 100 },
            { id: 'conduct', name: 'Misconduct', defaultAmount: 150 }
          ]
        },
        activity: []
      };

      // Add sample data
      this.addSampleData(initialData);

      // Store initialized data
      Object.keys(initialData).forEach(key => {
        localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(initialData[key]));
      });

      localStorage.setItem(`${this.prefix}initialized`, 'true');
    }

    this.initialized = true;
  }

  /**
   * Add sample data for demonstration
   */
  addSampleData(data) {
    // Sample employees
    const sampleEmployees = [
      {
        id: 'emp-001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        department: 'engineering',
        position: 'Senior Developer',
        startDate: '2022-01-15',
        salary: 6500,
        address: '123 Tech Lane, San Francisco, CA',
        status: 'active',
        imageUrl: 'https://i.pravatar.cc/150?img=11',
        createdAt: '2022-01-10T10:30:00Z'
      },
      {
        id: 'emp-002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '(555) 234-5678',
        department: 'marketing',
        position: 'Marketing Manager',
        startDate: '2022-02-01',
        salary: 5800,
        address: '456 Market Ave, San Francisco, CA',
        status: 'active',
        imageUrl: 'https://i.pravatar.cc/150?img=5',
        createdAt: '2022-01-25T14:45:00Z'
      },
      {
        id: 'emp-003',
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.j@example.com',
        phone: '(555) 345-6789',
        department: 'sales',
        position: 'Sales Representative',
        startDate: '2022-02-15',
        salary: 4900,
        address: '789 Sales Blvd, San Francisco, CA',
        status: 'active',
        imageUrl: 'https://i.pravatar.cc/150?img=3',
        createdAt: '2022-02-10T09:15:00Z'
      },
      {
        id: 'emp-004',
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.w@example.com',
        phone: '(555) 456-7890',
        department: 'hr',
        position: 'HR Specialist',
        startDate: '2022-03-01',
        salary: 5200,
        address: '101 HR Street, San Francisco, CA',
        status: 'active',
        imageUrl: 'https://i.pravatar.cc/150?img=6',
        createdAt: '2022-02-25T11:00:00Z'
      },
      {
        id: 'emp-005',
        firstName: 'Robert',
        lastName: 'Brown',
        email: 'robert.b@example.com',
        phone: '(555) 567-8901',
        department: 'finance',
        position: 'Financial Analyst',
        startDate: '2022-03-15',
        salary: 5500,
        address: '202 Finance Way, San Francisco, CA',
        status: 'active',
        imageUrl: 'https://i.pravatar.cc/150?img=12',
        createdAt: '2022-03-10T13:30:00Z'
      }
    ];
    
    data.employees = sampleEmployees;

    // Sample attendance records for the last week
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    
    const sampleAttendance = [];
    
    // Generate attendance for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - (i * oneDay));
      const dateStr = date.toISOString().split('T')[0];
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      if (!isWeekend) {
        // Add attendance for each employee on weekdays
        sampleEmployees.forEach(employee => {
          // Randomly decide if employee was absent (10% chance)
          const isAbsent = Math.random() < 0.1;
          
          if (isAbsent) {
            sampleAttendance.push({
              id: `att-${dateStr}-${employee.id}`,
              employeeId: employee.id,
              date: dateStr,
              status: 'absent',
              checkIn: null,
              checkOut: null,
              hoursWorked: 0,
              createdAt: date.toISOString()
            });
          } else {
            // Randomly decide if employee was late (20% chance)
            const isLate = Math.random() < 0.2;
            
            // Base check-in and check-out times
            const baseCheckIn = new Date(date);
            baseCheckIn.setHours(9, 0, 0, 0);
            
            const baseCheckOut = new Date(date);
            baseCheckOut.setHours(17, 0, 0, 0);
            
            // Adjust check-in time if late
            if (isLate) {
              // Late by 15-60 minutes
              const lateMinutes = Math.floor(Math.random() * 46) + 15;
              baseCheckIn.setMinutes(baseCheckIn.getMinutes() + lateMinutes);
            }
            
            // Randomly adjust check-out time (+/- 30 minutes)
            const checkOutAdjustment = Math.floor(Math.random() * 61) - 30;
            baseCheckOut.setMinutes(baseCheckOut.getMinutes() + checkOutAdjustment);
            
            // Calculate hours worked
            const hoursWorked = (baseCheckOut.getTime() - baseCheckIn.getTime()) / (1000 * 60 * 60);
            
            sampleAttendance.push({
              id: `att-${dateStr}-${employee.id}`,
              employeeId: employee.id,
              date: dateStr,
              status: isLate ? 'late' : 'present',
              checkIn: baseCheckIn.toISOString(),
              checkOut: baseCheckOut.toISOString(),
              hoursWorked: parseFloat(hoursWorked.toFixed(2)),
              createdAt: date.toISOString()
            });
          }
        });
      }
    }
    
    data.attendance = sampleAttendance;

    // Sample punishments
    const samplePunishments = [
      {
        id: 'pun-001',
        employeeId: 'emp-003',
        type: 'late',
        description: 'Late arrival by 45 minutes',
        date: new Date(today.getTime() - (3 * oneDay)).toISOString().split('T')[0],
        amount: 50,
        status: 'active',
        createdAt: new Date(today.getTime() - (3 * oneDay)).toISOString()
      },
      {
        id: 'pun-002',
        employeeId: 'emp-002',
        type: 'performance',
        description: 'Failed to meet quarterly targets',
        date: new Date(today.getTime() - (5 * oneDay)).toISOString().split('T')[0],
        amount: 100,
        status: 'active',
        createdAt: new Date(today.getTime() - (5 * oneDay)).toISOString()
      },
      {
        id: 'pun-003',
        employeeId: 'emp-001',
        type: 'late',
        description: 'Late arrival by 30 minutes',
        date: new Date(today.getTime() - (4 * oneDay)).toISOString().split('T')[0],
        amount: 30,
        status: 'completed',
        createdAt: new Date(today.getTime() - (4 * oneDay)).toISOString()
      }
    ];
    
    data.punishments = samplePunishments;

    // Sample activity feed
    const sampleActivity = [
      {
        id: 'act-001',
        type: 'employee_added',
        description: 'John Doe was added to the system',
        entityId: 'emp-001',
        timestamp: new Date(today.getTime() - (15 * oneDay)).toISOString()
      },
      {
        id: 'act-002',
        type: 'employee_added',
        description: 'Jane Smith was added to the system',
        entityId: 'emp-002',
        timestamp: new Date(today.getTime() - (14 * oneDay)).toISOString()
      },
      {
        id: 'act-003',
        type: 'punishment_added',
        description: 'John Doe received a late arrival punishment',
        entityId: 'pun-003',
        timestamp: new Date(today.getTime() - (4 * oneDay)).toISOString()
      },
      {
        id: 'act-004',
        type: 'settings_updated',
        description: 'Admin updated salary structure',
        entityId: 'settings',
        timestamp: new Date(today.getTime() - (2 * oneDay)).toISOString()
      }
    ];
    
    data.activity = sampleActivity;
  }

  /**
   * Get all items from a specific collection
   * @param {string} collection - Collection name
   * @returns {Array} - Collection data
   */
  getAll(collection) {
    const data = localStorage.getItem(`${this.prefix}${collection}`);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get a single item by ID from a collection
   * @param {string} collection - Collection name
   * @param {string} id - Item ID
   * @returns {Object|null} - The found item or null
   */
  getById(collection, id) {
    const items = this.getAll(collection);
    return items.find(item => item.id === id) || null;
  }

  /**
   * Add an item to a collection
   * @param {string} collection - Collection name
   * @param {Object} item - Item to add
   * @returns {Object} - The added item
   */
  add(collection, item) {
    const items = this.getAll(collection);
    items.push(item);
    localStorage.setItem(`${this.prefix}${collection}`, JSON.stringify(items));
    return item;
  }

  /**
   * Update an item in a collection
   * @param {string} collection - Collection name
   * @param {string} id - Item ID
   * @param {Object} updates - Properties to update
   * @returns {Object|null} - The updated item or null if not found
   */
  update(collection, id, updates) {
    const items = this.getAll(collection);
    const index = items.findIndex(item => item.id === id);

    if (index === -1) return null;

    const updatedItem = { ...items[index], ...updates };
    items[index] = updatedItem;
    localStorage.setItem(`${this.prefix}${collection}`, JSON.stringify(items));
    return updatedItem;
  }

  /**
   * Remove an item from a collection
   * @param {string} collection - Collection name
   * @param {string} id - Item ID
   * @returns {boolean} - True if removed, false if not found
   */
  remove(collection, id) {
    const items = this.getAll(collection);
    const initialLength = items.length;
    const filteredItems = items.filter(item => item.id !== id);

    if (filteredItems.length === initialLength) return false;

    localStorage.setItem(`${this.prefix}${collection}`, JSON.stringify(filteredItems));
    return true;
  }

  /**
   * Search for items in a collection
   * @param {string} collection - Collection name
   * @param {Function} predicate - Filter function
   * @returns {Array} - Matching items
   */
  find(collection, predicate) {
    const items = this.getAll(collection);
    return items.filter(predicate);
  }

  /**
   * Get settings
   * @param {string} category - Settings category
   * @returns {Object} - Settings
   */
  getSettings(category = null) {
    const settings = JSON.parse(localStorage.getItem(`${this.prefix}settings`) || '{}');
    return category ? settings[category] || {} : settings;
  }

  /**
   * Update settings
   * @param {string} category - Settings category
   * @param {Object} updates - Settings updates
   * @returns {Object} - Updated settings
   */
  updateSettings(category, updates) {
    const settings = this.getSettings();
    settings[category] = { ...(settings[category] || {}), ...updates };
    localStorage.setItem(`${this.prefix}settings`, JSON.stringify(settings));
    return settings[category];
  }

  /**
   * Clear all data
   */
  clearAll() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
    this.initialized = false;
    this.initializeStorage();
  }

  /**
   * Export all data
   * @returns {Object} - All data
   */
  exportData() {
    const data = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix) && key !== `${this.prefix}initialized`) {
        const collectionName = key.replace(this.prefix, '');
        data[collectionName] = JSON.parse(localStorage.getItem(key));
      }
    });
    return data;
  }

  /**
   * Import data
   * @param {Object} data - Data to import
   */
  importData(data) {
    Object.keys(data).forEach(collectionName => {
      localStorage.setItem(`${this.prefix}${collectionName}`, JSON.stringify(data[collectionName]));
    });
    localStorage.setItem(`${this.prefix}initialized`, 'true');
    this.initialized = true;
  }
}

// Create and export the storage service singleton
const storageService = new StorageService();