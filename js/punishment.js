/**
 * Punishment Service
 * 
 * Handles employee punishments and salary deductions.
 */

class PunishmentService {
  constructor() {
    this.storageKey = 'punishments';
  }

  /**
   * Get all punishments
   * @returns {Array} - All punishment records
   */
  getAllPunishments() {
    return storageService.getAll(this.storageKey);
  }

  /**
   * Get a punishment by ID
   * @param {string} id - Punishment ID
   * @returns {Object|null} - Punishment or null if not found
   */
  getPunishmentById(id) {
    return storageService.getById(this.storageKey, id);
  }

  /**
   * Get punishments for a specific employee
   * @param {string} employeeId - Employee ID
   * @returns {Array} - Punishment records for the employee
   */
  getEmployeePunishments(employeeId) {
    return storageService.find(this.storageKey, record => record.employeeId === employeeId);
  }

  /**
   * Get active punishments (not completed)
   * @returns {Array} - Active punishment records
   */
  getActivePunishments() {
    return storageService.find(this.storageKey, record => record.status === 'active');
  }

  /**
   * Create a new punishment
   * @param {Object} punishmentData - Punishment data
   * @returns {Object} - Created punishment record
   */
  createPunishment(punishmentData) {
    const newPunishment = {
      id: utils.generateId('pun-'),
      ...punishmentData,
      status: punishmentData.status || 'active',
      createdAt: new Date().toISOString()
    };
    
    const result = storageService.add(this.storageKey, newPunishment);
    
    // Log activity
    this.logActivity(newPunishment, 'created');
    
    return result;
  }

  /**
   * Update a punishment
   * @param {string} id - Punishment ID
   * @param {Object} updates - Properties to update
   * @returns {Object|null} - Updated punishment or null if not found
   */
  updatePunishment(id, updates) {
    const result = storageService.update(this.storageKey, id, updates);
    
    if (result) {
      // Log activity
      this.logActivity(result, 'updated');
    }
    
    return result;
  }

  /**
   * Delete a punishment
   * @param {string} id - Punishment ID
   * @returns {boolean} - Whether the punishment was deleted
   */
  deletePunishment(id) {
    const punishment = this.getPunishmentById(id);
    if (!punishment) return false;
    
    const result = storageService.remove(this.storageKey, id);
    
    if (result) {
      // Log activity
      this.logActivity(punishment, 'deleted');
    }
    
    return result;
  }

  /**
   * Complete a punishment (mark as completed)
   * @param {string} id - Punishment ID
   * @returns {Object|null} - Updated punishment or null if not found
   */
  completePunishment(id) {
    return this.updatePunishment(id, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });
  }

  /**
   * Get punishment statistics
   * @returns {Object} - Punishment statistics
   */
  getPunishmentStatistics() {
    const punishments = this.getAllPunishments();
    
    // Count by type
    const typeCount = {};
    punishments.forEach(punishment => {
      typeCount[punishment.type] = (typeCount[punishment.type] || 0) + 1;
    });
    
    // Count by status
    const statusCount = {
      active: 0,
      pending: 0,
      completed: 0
    };
    
    punishments.forEach(punishment => {
      if (statusCount[punishment.status] !== undefined) {
        statusCount[punishment.status]++;
      }
    });
    
    // Calculate total amount
    const totalAmount = punishments.reduce((sum, punishment) => sum + (punishment.amount || 0), 0);
    
    // Active amount (not completed)
    const activeAmount = punishments
      .filter(punishment => punishment.status === 'active')
      .reduce((sum, punishment) => sum + (punishment.amount || 0), 0);
    
    return {
      total: punishments.length,
      byType: typeCount,
      byStatus: statusCount,
      totalAmount,
      activeAmount
    };
  }

  /**
   * Get punishment data for chart visualization
   * @returns {Object} - Chart data
   */
  getPunishmentChartData() {
    const punishments = this.getAllPunishments();
    
    // Get punishment types from settings
    const punishmentTypes = storageService.getSettings('punishmentRules') || [];
    
    // Count by type
    const typeCount = {};
    const typeAmounts = {};
    
    // Initialize with 0 for all types
    punishmentTypes.forEach(type => {
      typeCount[type.id] = 0;
      typeAmounts[type.id] = 0;
    });
    
    // Count punishments by type
    punishments.forEach(punishment => {
      typeCount[punishment.type] = (typeCount[punishment.type] || 0) + 1;
      typeAmounts[punishment.type] = (typeAmounts[punishment.type] || 0) + (punishment.amount || 0);
    });
    
    // Prepare chart data
    const countData = {
      labels: [],
      data: [],
      colors: []
    };
    
    const amountData = {
      labels: [],
      data: [],
      colors: []
    };
    
    // Color mapping
    const typeColors = {
      late: '#FF9F0A', // warning color
      absence: '#FF3B30', // danger color
      performance: '#5E5CE6', // secondary color
      conduct: '#FF2D55', // pink color
      other: '#64D2FF' // info color
    };
    
    // Build chart data
    Object.keys(typeCount).forEach(type => {
      if (typeCount[type] > 0) {
        // Find the rule to get the readable name
        const rule = punishmentTypes.find(r => r.id === type);
        const typeName = rule ? rule.name : utils.capitalize(type);
        
        countData.labels.push(typeName);
        countData.data.push(typeCount[type]);
        countData.colors.push(typeColors[type] || '#64D2FF');
        
        amountData.labels.push(typeName);
        amountData.data.push(typeAmounts[type]);
        amountData.colors.push(typeColors[type] || '#64D2FF');
      }
    });
    
    return {
      byCount: countData,
      byAmount: amountData
    };
  }

  /**
   * Calculate total deductions for an employee
   * @param {string} employeeId - Employee ID
   * @param {string} [status] - Optional status filter ('active', 'pending', 'completed')
   * @returns {number} - Total deduction amount
   */
  calculateEmployeeDeductions(employeeId, status) {
    let punishments = this.getEmployeePunishments(employeeId);
    
    // Filter by status if provided
    if (status) {
      punishments = punishments.filter(p => p.status === status);
    }
    
    // Sum amounts
    return punishments.reduce((sum, punishment) => sum + (punishment.amount || 0), 0);
  }

  /**
   * Get punishment reports by date range
   * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
   * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
   * @returns {Array} - Punishment records in the date range
   */
  getPunishmentsByDateRange(startDate, endDate) {
    return storageService.find(this.storageKey, record => {
      return record.date >= startDate && record.date <= endDate;
    });
  }

  /**
   * Log a punishment-related activity
   * @param {Object} punishment - Punishment record
   * @param {string} action - Action performed ('created', 'updated', 'deleted', etc.)
   * @private
   */
  logActivity(punishment, action) {
    const employee = employeeService.getEmployeeById(punishment.employeeId);
    if (!employee) return;
    
    let description;
    switch (action) {
      case 'created':
        description = `${employee.firstName} ${employee.lastName} received a ${punishment.type} punishment`;
        break;
      case 'updated':
        description = `Punishment for ${employee.firstName} ${employee.lastName} was updated`;
        break;
      case 'deleted':
        description = `Punishment for ${employee.firstName} ${employee.lastName} was removed`;
        break;
      case 'completed':
        description = `Punishment for ${employee.firstName} ${employee.lastName} was completed`;
        break;
      default:
        description = `Punishment for ${employee.firstName} ${employee.lastName} was ${action}`;
    }
    
    const activityItem = {
      id: utils.generateId('act-'),
      type: 'punishment_' + action,
      description,
      entityId: punishment.id,
      timestamp: new Date().toISOString()
    };
    
    storageService.add('activity', activityItem);
  }
}

// Create and export the punishment service singleton
const punishmentService = new PunishmentService();