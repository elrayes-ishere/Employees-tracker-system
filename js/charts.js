/**
 * Chart Service
 * 
 * Handles chart creation and rendering using Chart.js
 */

class ChartService {
  constructor() {
    this.charts = {};
    this.loadChartJS();
  }

  /**
   * Load Chart.js from CDN
   */
  loadChartJS() {
    if (window.Chart) return; // Already loaded
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js';
    script.async = true;
    
    script.onload = () => {
      this.initDefaultCharts();
    };
    
    document.head.appendChild(script);
  }

  /**
   * Initialize default charts on page load
   */
  initDefaultCharts() {
    // We'll initialize these when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
      // Attendance chart
      this.createAttendanceChart();
      
      // Punishment chart
      this.createPunishmentChart();
    });
  }

  /**
   * Create the attendance overview chart
   * @param {string} period - Time period ('weekly', 'monthly', 'yearly')
   */
  createAttendanceChart(period = 'weekly') {
    const canvas = document.getElementById('attendanceChart');
    if (!canvas || !window.Chart) return;
    
    // Get attendance data
    const attendanceData = attendanceService.getAttendanceOverview(period);
    
    // Destroy existing chart if it exists
    if (this.charts.attendanceChart) {
      this.charts.attendanceChart.destroy();
    }
    
    // Create chart
    this.charts.attendanceChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: attendanceData.labels,
        datasets: [
          {
            label: 'Present',
            data: attendanceData.present,
            backgroundColor: '#30D158', // accent color
            borderColor: '#30D158',
            borderWidth: 1
          },
          {
            label: 'Late',
            data: attendanceData.late,
            backgroundColor: '#FF9F0A', // warning color
            borderColor: '#FF9F0A',
            borderWidth: 1
          },
          {
            label: 'Absent',
            data: attendanceData.absent,
            backgroundColor: '#FF3B30', // danger color
            borderColor: '#FF3B30',
            borderWidth: 1
          },
          {
            label: 'Leave',
            data: attendanceData.leave,
            backgroundColor: '#5E5CE6', // secondary color
            borderColor: '#5E5CE6',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false,
            text: 'Attendance Overview'
          }
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true
          }
        }
      }
    });
  }

  /**
   * Create the punishment categories chart
   */
  createPunishmentChart() {
    const canvas = document.getElementById('punishmentChart');
    if (!canvas || !window.Chart) return;
    
    // Get punishment data
    const punishmentData = punishmentService.getPunishmentChartData();
    
    // Destroy existing chart if it exists
    if (this.charts.punishmentChart) {
      this.charts.punishmentChart.destroy();
    }
    
    // Create chart
    this.charts.punishmentChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: punishmentData.byCount.labels,
        datasets: [
          {
            data: punishmentData.byCount.data,
            backgroundColor: punishmentData.byCount.colors,
            borderColor: 'rgba(255, 255, 255, 0.5)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: false,
            text: 'Punishment Categories'
          }
        },
        cutout: '60%'
      }
    });
  }

  /**
   * Create a bar chart
   * @param {string} canvasId - Canvas element ID
   * @param {Array} labels - Chart labels
   * @param {Array} datasets - Chart datasets
   * @param {Object} options - Chart options
   * @returns {Object} - Chart instance
   */
  createBarChart(canvasId, labels, datasets, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return null;
    
    // Destroy existing chart if it exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }
    
    // Default options
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
    
    // Create chart
    this.charts[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets
      },
      options: { ...defaultOptions, ...options }
    });
    
    return this.charts[canvasId];
  }

  /**
   * Create a line chart
   * @param {string} canvasId - Canvas element ID
   * @param {Array} labels - Chart labels
   * @param {Array} datasets - Chart datasets
   * @param {Object} options - Chart options
   * @returns {Object} - Chart instance
   */
  createLineChart(canvasId, labels, datasets, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return null;
    
    // Destroy existing chart if it exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }
    
    // Default options
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
    
    // Create chart
    this.charts[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets
      },
      options: { ...defaultOptions, ...options }
    });
    
    return this.charts[canvasId];
  }

  /**
   * Create a pie chart
   * @param {string} canvasId - Canvas element ID
   * @param {Array} labels - Chart labels
   * @param {Array} data - Chart data
   * @param {Array} colors - Background colors
   * @param {Object} options - Chart options
   * @returns {Object} - Chart instance
   */
  createPieChart(canvasId, labels, data, colors, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return null;
    
    // Destroy existing chart if it exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }
    
    // Default options
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        }
      }
    };
    
    // Create chart
    this.charts[canvasId] = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: 'rgba(255, 255, 255, 0.5)',
          borderWidth: 1
        }]
      },
      options: { ...defaultOptions, ...options }
    });
    
    return this.charts[canvasId];
  }

  /**
   * Create a doughnut chart
   * @param {string} canvasId - Canvas element ID
   * @param {Array} labels - Chart labels
   * @param {Array} data - Chart data
   * @param {Array} colors - Background colors
   * @param {Object} options - Chart options
   * @returns {Object} - Chart instance
   */
  createDoughnutChart(canvasId, labels, data, colors, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return null;
    
    // Destroy existing chart if it exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }
    
    // Default options
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        }
      },
      cutout: '60%'
    };
    
    // Create chart
    this.charts[canvasId] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: 'rgba(255, 255, 255, 0.5)',
          borderWidth: 1
        }]
      },
      options: { ...defaultOptions, ...options }
    });
    
    return this.charts[canvasId];
  }

  /**
   * Update an existing chart
   * @param {string} chartId - Chart ID
   * @param {Array} labels - New labels
   * @param {Array} datasets - New datasets
   */
  updateChart(chartId, labels, datasets) {
    const chart = this.charts[chartId];
    if (!chart) return;
    
    chart.data.labels = labels;
    
    // Update datasets
    if (Array.isArray(datasets)) {
      chart.data.datasets = datasets;
    } else {
      // If datasets is a single object, assuming it's data for a single dataset
      chart.data.datasets[0].data = datasets;
    }
    
    chart.update();
  }

  /**
   * Destroy a chart
   * @param {string} chartId - Chart ID
   */
  destroyChart(chartId) {
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
      delete this.charts[chartId];
    }
  }
}

// Create chart service singleton
const chartService = new ChartService();