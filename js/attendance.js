/**
 * Attendance Service
 * 
 * Handles attendance tracking and reporting.
 */

class AttendanceService {
  constructor() {
    this.storageKey = 'attendance';
  }

  /**
   * Get all attendance records
   * @returns {Array} - All attendance records
   */
  getAllAttendance() {
    return storageService.getAll(this.storageKey);
  }

  /**
   * Get attendance for a specific date
   * @param {string} date - Date in ISO format (YYYY-MM-DD)
   * @returns {Array} - Attendance records for the date
   */
  getAttendanceByDate(date) {
    return storageService.find(this.storageKey, record => record.date === date);
  }

  /**
   * Get attendance for a specific employee
   * @param {string} employeeId - Employee ID
   * @returns {Array} - Attendance records for the employee
   */
  getAttendanceByEmployee(employeeId) {
    return storageService.find(this.storageKey, record => record.employeeId === employeeId);
  }

  /**
   * Get attendance for a date range
   * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
   * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
   * @returns {Array} - Attendance records in the date range
   */
  getAttendanceByDateRange(startDate, endDate) {
    return storageService.find(this.storageKey, record => {
      return record.date >= startDate && record.date <= endDate;
    });
  }

  /**
   * Record attendance for an employee
   * @param {Object} attendanceData - Attendance data
   * @returns {Object} - Created attendance record
   */
  recordAttendance(attendanceData) {
    const newAttendance = {
      id: utils.generateId('att-'),
      ...attendanceData,
      createdAt: new Date().toISOString()
    };
    
    // If check-in and check-out are provided, calculate hours worked
    if (newAttendance.checkIn && newAttendance.checkOut) {
      newAttendance.hoursWorked = utils.calculateHours(
        newAttendance.checkIn,
        newAttendance.checkOut
      );
    }
    
    const result = storageService.add(this.storageKey, newAttendance);
    
    // Log activity
    this.logActivity(newAttendance);
    
    return result;
  }

  /**
   * Update an attendance record
   * @param {string} id - Attendance record ID
   * @param {Object} updates - Properties to update
   * @returns {Object|null} - Updated attendance record or null if not found
   */
  updateAttendance(id, updates) {
    const record = storageService.getById(this.storageKey, id);
    if (!record) return null;
    
    // Recalculate hours worked if check-in or check-out changed
    if (updates.checkIn || updates.checkOut) {
      const checkIn = updates.checkIn || record.checkIn;
      const checkOut = updates.checkOut || record.checkOut;
      
      if (checkIn && checkOut) {
        updates.hoursWorked = utils.calculateHours(checkIn, checkOut);
      }
    }
    
    const result = storageService.update(this.storageKey, id, updates);
    
    return result;
  }

  /**
   * Delete an attendance record
   * @param {string} id - Attendance record ID
   * @returns {boolean} - Whether the record was deleted
   */
  deleteAttendance(id) {
    return storageService.remove(this.storageKey, id);
  }

  /**
   * Mark attendance for a date
   * @param {string} date - Date in ISO format (YYYY-MM-DD)
   * @param {Array} attendanceData - Array of attendance data for employees
   * @returns {Array} - Created/updated attendance records
   */
  markDateAttendance(date, attendanceData) {
    const results = [];
    
    // Get existing attendance for this date
    const existingRecords = this.getAttendanceByDate(date);
    
    // Process each attendance entry
    attendanceData.forEach(entry => {
      const existingRecord = existingRecords.find(
        record => record.employeeId === entry.employeeId
      );
      
      // Update existing record or create new one
      if (existingRecord) {
        const updated = this.updateAttendance(existingRecord.id, entry);
        if (updated) results.push(updated);
      } else {
        const newRecord = this.recordAttendance({
          ...entry,
          date
        });
        results.push(newRecord);
      }
    });
    
    return results;
  }

  /**
   * Get attendance statistics for a date
   * @param {string} date - Date in ISO format (YYYY-MM-DD)
   * @returns {Object} - Attendance statistics
   */
  getDateStatistics(date) {
    const records = this.getAttendanceByDate(date);
    const allEmployees = employeeService.getAllEmployees();
    
    // Count by status
    const counts = {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0
    };
    
    records.forEach(record => {
      if (counts[record.status] !== undefined) {
        counts[record.status]++;
      }
    });
    
    // Calculate attendance percentage
    const activeEmployees = allEmployees.filter(emp => emp.status === 'active').length;
    const attendanceRate = activeEmployees > 0 
      ? ((counts.present + counts.late) / activeEmployees) * 100 
      : 0;
    
    // Calculate average hours worked
    const workedRecords = records.filter(record => record.hoursWorked);
    const totalHours = workedRecords.reduce((sum, record) => sum + record.hoursWorked, 0);
    const avgHours = workedRecords.length > 0 ? totalHours / workedRecords.length : 0;
    
    return {
      date,
      counts,
      attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      averageHours: parseFloat(avgHours.toFixed(2)),
      recordedCount: records.length,
      totalEmployees: allEmployees.length,
      activeEmployees
    };
  }

  /**
   * Get attendance overview for a period
   * @param {string} period - Period type ('week', 'month', 'year')
   * @returns {Object} - Attendance overview data
   */
  getAttendanceOverview(period = 'week') {
    let startDate, endDate;
    const today = new Date();
    
    // Determine date range based on period
    switch (period) {
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      case 'week':
      default:
        // Last 7 days including today
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        endDate = new Date(today);
        break;
    }
    
    // Format dates to ISO
    const startIso = startDate.toISOString().split('T')[0];
    const endIso = endDate.toISOString().split('T')[0];
    
    // Get records in range
    const records = this.getAttendanceByDateRange(startIso, endIso);
    
    // Prepare data structure
    let dateLabels = [];
    let presentData = [];
    let absentData = [];
    let lateData = [];
    let leaveData = [];
    
    // Helper function to generate dates in range
    const getDatesInRange = (start, end) => {
      const dates = [];
      const current = new Date(start);
      
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      
      return dates;
    };
    
    // Generate all dates in range
    const allDates = getDatesInRange(startDate, endDate);
    
    // For weekly view, use day names
    if (period === 'week') {
      dateLabels = allDates.map(date => {
        const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        return day;
      });
    } 
    // For monthly view, use day numbers
    else if (period === 'month') {
      dateLabels = allDates.map(date => {
        return new Date(date).getDate().toString();
      });
    }
    // For yearly view, use month names
    else if (period === 'year') {
      // Group by month
      const monthlyData = {};
      
      // Initialize months
      for (let i = 0; i < 12; i++) {
        const monthName = new Date(today.getFullYear(), i, 1)
          .toLocaleDateString('en-US', { month: 'short' });
        
        monthlyData[monthName] = {
          present: 0,
          absent: 0,
          late: 0,
          leave: 0
        };
      }
      
      // Group records by month
      records.forEach(record => {
        const date = new Date(record.date);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        if (monthlyData[monthName] && monthlyData[monthName][record.status] !== undefined) {
          monthlyData[monthName][record.status]++;
        }
      });
      
      // Prepare data for chart
      dateLabels = Object.keys(monthlyData);
      presentData = dateLabels.map(month => monthlyData[month].present);
      absentData = dateLabels.map(month => monthlyData[month].absent);
      lateData = dateLabels.map(month => monthlyData[month].late);
      leaveData = dateLabels.map(month => monthlyData[month].leave);
      
      return {
        labels: dateLabels,
        present: presentData,
        absent: absentData,
        late: lateData,
        leave: leaveData
      };
    }
    
    // For daily data (week or month view)
    allDates.forEach(date => {
      // Get records for this date
      const dayRecords = records.filter(record => record.date === date);
      
      // Count statuses
      const statusCounts = {
        present: 0,
        absent: 0,
        late: 0,
        leave: 0
      };
      
      dayRecords.forEach(record => {
        if (statusCounts[record.status] !== undefined) {
          statusCounts[record.status]++;
        }
      });
      
      // Add to data arrays
      presentData.push(statusCounts.present);
      absentData.push(statusCounts.absent);
      lateData.push(statusCounts.late);
      leaveData.push(statusCounts.leave);
    });
    
    return {
      labels: dateLabels,
      present: presentData,
      absent: absentData,
      late: lateData,
      leave: leaveData
    };
  }

  /**
   * Get employee attendance summary
   * @param {string} employeeId - Employee ID
   * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
   * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
   * @returns {Object} - Attendance summary
   */
  getEmployeeAttendanceSummary(employeeId, startDate, endDate) {
    const records = this.getAttendanceByEmployee(employeeId)
      .filter(record => record.date >= startDate && record.date <= endDate);
    
    // Count by status
    const statusCounts = {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0
    };
    
    records.forEach(record => {
      if (statusCounts[record.status] !== undefined) {
        statusCounts[record.status]++;
      }
    });
    
    // Calculate totals
    const totalDays = records.length;
    const presentDays = statusCounts.present + statusCounts.late;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
    
    // Calculate total hours worked
    const totalHours = records.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
    
    // Calculate average check-in time
    const checkInTimes = records
      .filter(record => record.checkIn)
      .map(record => new Date(record.checkIn).getHours() * 60 + new Date(record.checkIn).getMinutes());
    
    const avgCheckInMinutes = checkInTimes.length > 0 
      ? checkInTimes.reduce((sum, mins) => sum + mins, 0) / checkInTimes.length 
      : 0;
    
    const avgCheckInHours = Math.floor(avgCheckInMinutes / 60);
    const avgCheckInMins = Math.floor(avgCheckInMinutes % 60);
    
    return {
      employeeId,
      period: `${startDate} to ${endDate}`,
      statusCounts,
      totalDays,
      presentDays,
      attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      totalHoursWorked: parseFloat(totalHours.toFixed(2)),
      averageCheckIn: `${avgCheckInHours.toString().padStart(2, '0')}:${avgCheckInMins.toString().padStart(2, '0')}`
    };
  }

  /**
   * Log an attendance-related activity
   * @param {Object} record - Attendance record
   * @private
   */
  logActivity(record) {
    const employee = employeeService.getEmployeeById(record.employeeId);
    if (!employee) return;
    
    let description;
    switch (record.status) {
      case 'present':
        description = `${employee.firstName} ${employee.lastName} checked in`;
        break;
      case 'absent':
        description = `${employee.firstName} ${employee.lastName} marked as absent`;
        break;
      case 'late':
        description = `${employee.firstName} ${employee.lastName} arrived late`;
        break;
      case 'leave':
        description = `${employee.firstName} ${employee.lastName} on leave`;
        break;
      default:
        description = `${employee.firstName} ${employee.lastName}'s attendance recorded`;
    }
    
    const activityItem = {
      id: utils.generateId('act-'),
      type: 'attendance_recorded',
      description,
      entityId: record.id,
      timestamp: new Date().toISOString()
    };
    
    storageService.add('activity', activityItem);
  }
}

// Create and export the attendance service singleton
const attendanceService = new AttendanceService();