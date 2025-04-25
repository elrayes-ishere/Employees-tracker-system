/**
 * Report Service
 * 
 * Handles report generation and data analysis.
 */

class ReportService {
  constructor() {
    // Initialize service
  }

  /**
   * Generate an attendance summary report
   * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
   * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
   * @returns {Object} - Attendance summary report
   */
  generateAttendanceSummary(startDate, endDate) {
    // Get all attendance records in the date range
    const records = attendanceService.getAttendanceByDateRange(startDate, endDate);
    
    // Get all employees
    const employees = employeeService.getAllEmployees();
    
    // Calculate overall statistics
    const totalEmployees = employees.length;
    
    // Count by status
    const totalStatusCounts = {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0
    };
    
    records.forEach(record => {
      if (totalStatusCounts[record.status] !== undefined) {
        totalStatusCounts[record.status]++;
      }
    });
    
    // Calculate total work days in the period
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const daysDiff = Math.round((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;
    
    // Filter out weekends (simple approach, counting Mon-Fri)
    let workDays = 0;
    const currentDate = new Date(startDateObj);
    while (currentDate <= endDateObj) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Calculate expected attendance (employees × work days)
    const expectedAttendance = totalEmployees * workDays;
    
    // Calculate attendance rate
    const presentDays = totalStatusCounts.present + totalStatusCounts.late;
    const attendanceRate = expectedAttendance > 0 
      ? (presentDays / expectedAttendance) * 100 
      : 0;
    
    // Calculate per-employee statistics
    const employeeStats = employees.map(employee => {
      const employeeRecords = records.filter(record => record.employeeId === employee.id);
      
      // Count by status
      const statusCounts = {
        present: 0,
        absent: 0,
        late: 0,
        leave: 0
      };
      
      employeeRecords.forEach(record => {
        if (statusCounts[record.status] !== undefined) {
          statusCounts[record.status]++;
        }
      });
      
      // Calculate attendance rate
      const presentDays = statusCounts.present + statusCounts.late;
      const attendanceRate = workDays > 0 ? (presentDays / workDays) * 100 : 0;
      
      // Calculate total hours worked
      const totalHours = employeeRecords.reduce(
        (sum, record) => sum + (record.hoursWorked || 0), 
        0
      );
      
      // Count late days
      const lateDays = statusCounts.late;
      
      return {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
        statusCounts,
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),
        totalHours: parseFloat(totalHours.toFixed(2)),
        lateDays,
        absentDays: statusCounts.absent,
        leaveDays: statusCounts.leave
      };
    });
    
    // Calculate daily statistics
    const dailyStats = [];
    
    // Get unique dates from records
    const uniqueDates = [...new Set(records.map(record => record.date))].sort();
    
    uniqueDates.forEach(date => {
      const dateRecords = records.filter(record => record.date === date);
      
      // Count by status
      const statusCounts = {
        present: 0,
        absent: 0,
        late: 0,
        leave: 0
      };
      
      dateRecords.forEach(record => {
        if (statusCounts[record.status] !== undefined) {
          statusCounts[record.status]++;
        }
      });
      
      // Calculate attendance rate for the day
      const presentCount = statusCounts.present + statusCounts.late;
      const attendanceRate = totalEmployees > 0 
        ? (presentCount / totalEmployees) * 100 
        : 0;
      
      dailyStats.push({
        date,
        statusCounts,
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),
        totalRecords: dateRecords.length
      });
    });
    
    // Return report data
    return {
      reportType: 'attendance_summary',
      period: {
        startDate,
        endDate,
        totalDays: daysDiff,
        workDays
      },
      overall: {
        totalEmployees,
        expectedAttendance,
        actualAttendance: presentDays,
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),
        statusCounts: totalStatusCounts
      },
      employeeStats: employeeStats.sort((a, b) => b.attendanceRate - a.attendanceRate),
      dailyStats: dailyStats.sort((a, b) => a.date.localeCompare(b.date)),
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate a salary report
   * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
   * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
   * @returns {Object} - Salary report
   */
  generateSalaryReport(startDate, endDate) {
    // Get all employees
    const employees = employeeService.getAllEmployees();
    
    // Get punishments in the date range
    const punishments = punishmentService.getPunishmentsByDateRange(startDate, endDate);
    
    // Get currency from settings
    const salarySettings = storageService.getSettings('salary');
    const currency = salarySettings?.currency || 'USD';
    
    // Calculate per-employee salary details
    const employeeSalaries = employees.map(employee => {
      // Get punishments for this employee
      const employeePunishments = punishments.filter(p => p.employeeId === employee.id);
      
      // Calculate total deductions
      const totalDeductions = employeePunishments.reduce(
        (sum, punishment) => sum + (punishment.amount || 0), 
        0
      );
      
      // Calculate net salary
      const baseSalary = employee.salary || 0;
      const netSalary = baseSalary - totalDeductions;
      
      // Calculate deduction percentage
      const deductionPercentage = baseSalary > 0 
        ? (totalDeductions / baseSalary) * 100 
        : 0;
      
      // Get punishment details
      const punishmentDetails = employeePunishments.map(punishment => ({
        id: punishment.id,
        type: punishment.type,
        date: punishment.date,
        amount: punishment.amount,
        description: punishment.description
      }));
      
      return {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
        position: employee.position,
        baseSalary,
        deductions: totalDeductions,
        netSalary,
        deductionPercentage: parseFloat(deductionPercentage.toFixed(2)),
        punishmentCount: employeePunishments.length,
        punishmentDetails
      };
    });
    
    // Calculate department summaries
    const departmentSummary = {};
    
    employeeSalaries.forEach(employeeSalary => {
      const dept = employeeSalary.department;
      
      if (!departmentSummary[dept]) {
        departmentSummary[dept] = {
          totalEmployees: 0,
          totalBaseSalary: 0,
          totalDeductions: 0,
          totalNetSalary: 0,
          averageDeductionPercentage: 0
        };
      }
      
      departmentSummary[dept].totalEmployees++;
      departmentSummary[dept].totalBaseSalary += employeeSalary.baseSalary;
      departmentSummary[dept].totalDeductions += employeeSalary.deductions;
      departmentSummary[dept].totalNetSalary += employeeSalary.netSalary;
    });
    
    // Calculate averages for department summary
    Object.keys(departmentSummary).forEach(dept => {
      const summary = departmentSummary[dept];
      
      summary.averageBaseSalary = summary.totalEmployees > 0 
        ? summary.totalBaseSalary / summary.totalEmployees 
        : 0;
        
      summary.averageDeductions = summary.totalEmployees > 0 
        ? summary.totalDeductions / summary.totalEmployees 
        : 0;
        
      summary.averageNetSalary = summary.totalEmployees > 0 
        ? summary.totalNetSalary / summary.totalEmployees 
        : 0;
        
      summary.averageDeductionPercentage = summary.totalBaseSalary > 0 
        ? (summary.totalDeductions / summary.totalBaseSalary) * 100 
        : 0;
        
      // Round numeric values
      summary.averageBaseSalary = parseFloat(summary.averageBaseSalary.toFixed(2));
      summary.averageDeductions = parseFloat(summary.averageDeductions.toFixed(2));
      summary.averageNetSalary = parseFloat(summary.averageNetSalary.toFixed(2));
      summary.averageDeductionPercentage = parseFloat(summary.averageDeductionPercentage.toFixed(2));
    });
    
    // Calculate overall totals
    const totalBaseSalary = employeeSalaries.reduce(
      (sum, emp) => sum + emp.baseSalary, 
      0
    );
    
    const totalDeductions = employeeSalaries.reduce(
      (sum, emp) => sum + emp.deductions, 
      0
    );
    
    const totalNetSalary = employeeSalaries.reduce(
      (sum, emp) => sum + emp.netSalary, 
      0
    );
    
    const overallDeductionPercentage = totalBaseSalary > 0 
      ? (totalDeductions / totalBaseSalary) * 100 
      : 0;
      
    // Return report data
    return {
      reportType: 'salary_report',
      period: {
        startDate,
        endDate
      },
      currency,
      overall: {
        totalEmployees: employees.length,
        totalBaseSalary,
        totalDeductions,
        totalNetSalary,
        overallDeductionPercentage: parseFloat(overallDeductionPercentage.toFixed(2))
      },
      departmentSummary,
      employeeSalaries: employeeSalaries.sort((a, b) => b.baseSalary - a.baseSalary),
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate a punishment report
   * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
   * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
   * @returns {Object} - Punishment report
   */
  generatePunishmentReport(startDate, endDate) {
    // Get punishments in the date range
    const punishments = punishmentService.getPunishmentsByDateRange(startDate, endDate);
    
    // Get punishment types from settings
    const punishmentRules = storageService.getSettings('punishmentRules') || [];
    
    // Get all employees
    const employees = employeeService.getAllEmployees();
    
    // Create a lookup map for employees
    const employeeMap = {};
    employees.forEach(emp => {
      employeeMap[emp.id] = emp;
    });
    
    // Count by type
    const typeCounts = {};
    punishmentRules.forEach(rule => {
      typeCounts[rule.id] = {
        count: 0,
        amount: 0,
        name: rule.name
      };
    });
    
    // Add "other" type
    typeCounts.other = {
      count: 0,
      amount: 0,
      name: 'Other'
    };
    
    // Count by status
    const statusCounts = {
      active: {
        count: 0,
        amount: 0
      },
      pending: {
        count: 0,
        amount: 0
      },
      completed: {
        count: 0,
        amount: 0
      }
    };
    
    // Process each punishment
    punishments.forEach(punishment => {
      // Count by type
      if (typeCounts[punishment.type]) {
        typeCounts[punishment.type].count++;
        typeCounts[punishment.type].amount += (punishment.amount || 0);
      } else {
        typeCounts.other.count++;
        typeCounts.other.amount += (punishment.amount || 0);
      }
      
      // Count by status
      if (statusCounts[punishment.status]) {
        statusCounts[punishment.status].count++;
        statusCounts[punishment.status].amount += (punishment.amount || 0);
      }
    });
    
    // Get department punishment summaries
    const departmentSummary = {};
    
    punishments.forEach(punishment => {
      const employee = employeeMap[punishment.employeeId];
      if (!employee) return;
      
      const dept = employee.department;
      
      if (!departmentSummary[dept]) {
        departmentSummary[dept] = {
          count: 0,
          amount: 0,
          byType: {}
        };
      }
      
      departmentSummary[dept].count++;
      departmentSummary[dept].amount += (punishment.amount || 0);
      
      // Count by type for this department
      if (!departmentSummary[dept].byType[punishment.type]) {
        departmentSummary[dept].byType[punishment.type] = {
          count: 0,
          amount: 0
        };
      }
      
      departmentSummary[dept].byType[punishment.type].count++;
      departmentSummary[dept].byType[punishment.type].amount += (punishment.amount || 0);
    });
    
    // Get employee punishment summaries
    const employeeSummary = {};
    
    punishments.forEach(punishment => {
      const empId = punishment.employeeId;
      
      if (!employeeSummary[empId]) {
        const employee = employeeMap[empId];
        
        employeeSummary[empId] = {
          id: empId,
          name: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee',
          department: employee ? employee.department : 'Unknown',
          count: 0,
          amount: 0,
          byType: {}
        };
      }
      
      employeeSummary[empId].count++;
      employeeSummary[empId].amount += (punishment.amount || 0);
      
      // Count by type for this employee
      if (!employeeSummary[empId].byType[punishment.type]) {
        employeeSummary[empId].byType[punishment.type] = {
          count: 0,
          amount: 0
        };
      }
      
      employeeSummary[empId].byType[punishment.type].count++;
      employeeSummary[empId].byType[punishment.type].amount += (punishment.amount || 0);
    });
    
    // Convert employee summary to array and sort
    const employeeSummaryArray = Object.values(employeeSummary).sort(
      (a, b) => b.count - a.count
    );
    
    // Calculate totals
    const totalCount = punishments.length;
    const totalAmount = punishments.reduce(
      (sum, punishment) => sum + (punishment.amount || 0), 
      0
    );
    
    // Add detailed punishment records
    const detailedRecords = punishments.map(punishment => {
      const employee = employeeMap[punishment.employeeId];
      
      return {
        id: punishment.id,
        employeeId: punishment.employeeId,
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee',
        department: employee ? employee.department : 'Unknown',
        type: punishment.type,
        typeName: typeCounts[punishment.type]?.name || 'Other',
        date: punishment.date,
        amount: punishment.amount,
        status: punishment.status,
        description: punishment.description,
        createdAt: punishment.createdAt
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Return report data
    return {
      reportType: 'punishment_report',
      period: {
        startDate,
        endDate
      },
      overall: {
        totalCount,
        totalAmount,
        byType: typeCounts,
        byStatus: statusCounts
      },
      departmentSummary,
      employeeSummary: employeeSummaryArray,
      detailedRecords,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate a department performance report
   * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
   * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
   * @returns {Object} - Department performance report
   */
  generateDepartmentPerformance(startDate, endDate) {
    // This is a placeholder for a more comprehensive performance report
    // In a real application, this would include various performance metrics
    
    // Get all employees
    const employees = employeeService.getAllEmployees();
    
    // Get attendance data
    const attendanceRecords = attendanceService.getAttendanceByDateRange(startDate, endDate);
    
    // Get punishment data
    const punishments = punishmentService.getPunishmentsByDateRange(startDate, endDate);
    
    // Group employees by department
    const departmentEmployees = {};
    employees.forEach(employee => {
      const dept = employee.department;
      
      if (!departmentEmployees[dept]) {
        departmentEmployees[dept] = [];
      }
      
      departmentEmployees[dept].push(employee);
    });
    
    // Calculate performance metrics for each department
    const departmentPerformance = {};
    
    Object.keys(departmentEmployees).forEach(dept => {
      const deptEmployees = departmentEmployees[dept];
      const employeeIds = deptEmployees.map(emp => emp.id);
      
      // Attendance metrics
      const deptAttendance = attendanceRecords.filter(
        record => employeeIds.includes(record.employeeId)
      );
      
      const attendanceStatusCounts = {
        present: 0,
        absent: 0,
        late: 0,
        leave: 0
      };
      
      deptAttendance.forEach(record => {
        if (attendanceStatusCounts[record.status] !== undefined) {
          attendanceStatusCounts[record.status]++;
        }
      });
      
      const totalAttendanceRecords = deptAttendance.length;
      const presentDays = attendanceStatusCounts.present + attendanceStatusCounts.late;
      const attendanceRate = totalAttendanceRecords > 0 
        ? (presentDays / totalAttendanceRecords) * 100 
        : 0;
      
      // Punishment metrics
      const deptPunishments = punishments.filter(
        punishment => employeeIds.includes(punishment.employeeId)
      );
      
      const punishmentCount = deptPunishments.length;
      const punishmentAmount = deptPunishments.reduce(
        (sum, punishment) => sum + (punishment.amount || 0), 
        0
      );
      
      // Calculate per-employee metrics
      const punishmentsPerEmployee = deptEmployees.length > 0 
        ? punishmentCount / deptEmployees.length 
        : 0;
        
      const avgPunishmentAmount = punishmentCount > 0 
        ? punishmentAmount / punishmentCount 
        : 0;
      
      // Calculate total salary and average salary
      const totalSalary = deptEmployees.reduce(
        (sum, emp) => sum + (emp.salary || 0), 
        0
      );
      
      const avgSalary = deptEmployees.length > 0 
        ? totalSalary / deptEmployees.length 
        : 0;
      
      // Calculate performance score (example metric)
      // Higher attendance rate and lower punishments = better performance
      // This is a simplified example; a real system would use more sophisticated metrics
      const performanceScore = (
        (attendanceRate * 0.6) + 
        (100 - (punishmentsPerEmployee * 20)) * 0.4
      );
      
      departmentPerformance[dept] = {
        name: dept,
        employeeCount: deptEmployees.length,
        attendance: {
          total: totalAttendanceRecords,
          present: attendanceStatusCounts.present,
          absent: attendanceStatusCounts.absent,
          late: attendanceStatusCounts.late,
          leave: attendanceStatusCounts.leave,
          attendanceRate: parseFloat(attendanceRate.toFixed(2))
        },
        punishments: {
          total: punishmentCount,
          amount: punishmentAmount,
          perEmployee: parseFloat(punishmentsPerEmployee.toFixed(2)),
          avgAmount: parseFloat(avgPunishmentAmount.toFixed(2))
        },
        salary: {
          total: totalSalary,
          average: parseFloat(avgSalary.toFixed(2))
        },
        performanceScore: parseFloat(performanceScore.toFixed(2))
      };
    });
    
    // Convert to array and sort by performance score
    const departmentPerformanceArray = Object.values(departmentPerformance).sort(
      (a, b) => b.performanceScore - a.performanceScore
    );
    
    // Return report data
    return {
      reportType: 'department_performance',
      period: {
        startDate,
        endDate
      },
      departmentPerformance: departmentPerformanceArray,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate an employee activity report
   * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
   * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
   * @returns {Object} - Employee activity report
   */
  generateEmployeeActivity(startDate, endDate) {
    // Get all activity records
    const allActivity = storageService.getAll('activity');
    
    // Convert dates to timestamps for comparison
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).setHours(23, 59, 59, 999); // End of day
    
    // Filter activities in the date range
    const activities = allActivity.filter(activity => {
      const activityTime = new Date(activity.timestamp).getTime();
      return activityTime >= startTimestamp && activityTime <= endTimestamp;
    });
    
    // Group activities by type
    const activityByType = {};
    
    activities.forEach(activity => {
      const type = activity.type;
      
      if (!activityByType[type]) {
        activityByType[type] = [];
      }
      
      activityByType[type].push(activity);
    });
    
    // Group activities by day
    const activityByDay = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toISOString().split('T')[0];
      
      if (!activityByDay[date]) {
        activityByDay[date] = [];
      }
      
      activityByDay[date].push(activity);
    });
    
    // Count activities by day for chart
    const dates = Object.keys(activityByDay).sort();
    const activityCounts = dates.map(date => activityByDay[date].length);
    
    // Return report data
    return {
      reportType: 'employee_activity',
      period: {
        startDate,
        endDate
      },
      overall: {
        totalActivities: activities.length,
        byType: Object.keys(activityByType).map(type => ({
          type,
          count: activityByType[type].length,
          activities: activityByType[type]
        }))
      },
      timeline: {
        dates,
        counts: activityCounts
      },
      activities: activities.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      ),
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate a custom report (placeholder)
   * @param {Object} config - Report configuration
   * @returns {Object} - Custom report
   */
  generateCustomReport(config) {
    // In a real application, this would generate a flexible report based on config
    return {
      reportType: 'custom_report',
      config,
      message: 'Custom report functionality would be implemented here',
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Export a report to JSON
   * @param {Object} report - Report data
   * @returns {string} - JSON string
   */
  exportReportToJSON(report) {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export a report to CSV (simplified)
   * @param {Object} report - Report data
   * @returns {string} - CSV string
   */
  exportReportToCSV(report) {
    // This is a simplified CSV export
    // A real implementation would handle complex nested structures better
    
    let csv = '';
    const reportType = report.reportType;
    
    // Handle different report types
    switch (reportType) {
      case 'attendance_summary': {
        // Export employee stats
        csv = 'Employee,Department,Present,Absent,Late,Leave,Attendance Rate,Total Hours\n';
        report.employeeStats.forEach(emp => {
          csv += `"${emp.name}","${emp.department}",${emp.statusCounts.present},${emp.statusCounts.absent},${emp.statusCounts.late},${emp.statusCounts.leave},${emp.attendanceRate},${emp.totalHours}\n`;
        });
        break;
      }
      
      case 'salary_report': {
        // Export employee salaries
        csv = 'Employee,Department,Position,Base Salary,Deductions,Net Salary,Deduction %\n';
        report.employeeSalaries.forEach(emp => {
          csv += `"${emp.name}","${emp.department}","${emp.position}",${emp.baseSalary},${emp.deductions},${emp.netSalary},${emp.deductionPercentage}\n`;
        });
        break;
      }
      
      case 'punishment_report': {
        // Export detailed records
        csv = 'Date,Employee,Department,Type,Amount,Status,Description\n';
        report.detailedRecords.forEach(record => {
          csv += `"${record.date}","${record.employeeName}","${record.department}","${record.typeName}",${record.amount},"${record.status}","${record.description.replace(/"/g, '""')}"\n`;
        });
        break;
      }
      
      default:
        csv = 'Report data could not be converted to CSV format';
        break;
    }
    
    return csv;
  }
}

// Create and export the report service singleton
const reportService = new ReportService();