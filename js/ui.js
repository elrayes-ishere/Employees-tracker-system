/**
 * UI Service
 * 
 * Handles UI interactions and DOM manipulation.
 */

class UIService {
  constructor() {
    this.currentSection = 'dashboard';
    this.modals = {};
  }

  /**
   * Initialize UI elements and event listeners
   */
  initialize() {
    this.initNavigation();
    this.initModals();
    this.initThemeToggle();
    this.initDateDisplays();
    this.initFilters();
    this.initTableActions();
    this.initSettingsPanel();
    this.initReportPanel();
    
    // Render initial data
    this.renderDashboardStats();
  }

  /**
   * Initialize navigation
   */
  initNavigation() {
    // Nav links
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        this.showSection(section);
      });
    });
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('open');
        menuToggle.classList.toggle('active');
      });
    }
    
    // Handle hash in URL
    const hash = window.location.hash.substring(1);
    if (hash) {
      this.showSection(hash);
    }
    
    // Update hash when section changes
    window.addEventListener('popstate', () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        this.showSection(hash, false);
      }
    });
  }

  /**
   * Show a specific section
   * @param {string} sectionId - Section ID
   * @param {boolean} updateHash - Whether to update the URL hash
   */
  showSection(sectionId, updateHash = true) {
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.sidebar-nav li');
    
    // Hide all sections
    sections.forEach(section => {
      section.classList.remove('active');
    });
    
    // Remove active class from all nav items
    navItems.forEach(item => {
      item.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add('active');
      this.currentSection = sectionId;
      
      // Add active class to nav item
      const navItem = document.querySelector(`.sidebar-nav li a[data-section="${sectionId}"]`);
      if (navItem) {
        navItem.parentElement.classList.add('active');
      }
      
      // Update hash in URL
      if (updateHash) {
        window.location.hash = sectionId;
      }
      
      // Load section-specific data
      this.loadSectionData(sectionId);
      
      // Close mobile menu if open
      if (window.innerWidth < 992) {
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.getElementById('menuToggle');
        
        if (sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
          menuToggle.classList.remove('active');
        }
      }
    }
  }

  /**
   * Load data for a specific section
   * @param {string} sectionId - Section ID
   */
  loadSectionData(sectionId) {
    switch (sectionId) {
      case 'dashboard':
        this.renderDashboardStats();
        this.renderTopPerformers();
        break;
      case 'employees':
        this.renderEmployeesList();
        break;
      case 'attendance':
        this.renderAttendanceTable();
        break;
      case 'punishments':
        this.renderPunishmentTable();
        break;
      case 'reports':
        // Reports are loaded on demand
        break;
      case 'settings':
        this.loadSettings();
        break;
    }
  }

  /**
   * Initialize modals
   */
  initModals() {
    // Get all modals
    const modalElements = document.querySelectorAll('.modal');
    
    modalElements.forEach(modal => {
      const modalId = modal.id;
      
      // Store reference to modal
      this.modals[modalId] = modal;
      
      // Add event listeners for close buttons
      const closeButtons = modal.querySelectorAll('.close-modal, .cancel-modal');
      closeButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.closeModal(modalId);
        });
      });
      
      // Close modal when clicking outside
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modalId);
        }
      });
    });
    
    // Add Employee modal
    const addEmployeeButtons = document.querySelectorAll('#addEmployeeBtn, #addEmployeeBtn2');
    addEmployeeButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.openModal('addEmployeeModal');
      });
    });
    
    // Add Punishment modal
    const addPunishmentButton = document.getElementById('addPunishmentBtn');
    if (addPunishmentButton) {
      addPunishmentButton.addEventListener('click', () => {
        this.populatePunishmentEmployees();
        this.openModal('addPunishmentModal');
      });
    }
    
    // Save Employee button
    const saveEmployeeBtn = document.getElementById('saveEmployeeBtn');
    if (saveEmployeeBtn) {
      saveEmployeeBtn.addEventListener('click', () => {
        this.saveEmployee();
      });
    }
    
    // Save Punishment button
    const savePunishmentBtn = document.getElementById('savePunishmentBtn');
    if (savePunishmentBtn) {
      savePunishmentBtn.addEventListener('click', () => {
        this.savePunishment();
      });
    }
  }

  /**
   * Open a modal
   * @param {string} modalId - Modal ID
   */
  openModal(modalId) {
    const modal = this.modals[modalId];
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Close a modal
   * @param {string} modalId - Modal ID
   */
  closeModal(modalId) {
    const modal = this.modals[modalId];
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  /**
   * Initialize theme toggle
   */
  initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Check saved preference
      const savedTheme = localStorage.getItem('staffTrack_theme');
      
      // Set initial state
      if (savedTheme === 'dark' || (savedTheme !== 'light' && prefersDark)) {
        document.body.classList.add('dark-theme');
        themeToggle.checked = true;
      }
      
      // Add event listener
      themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
          document.body.classList.add('dark-theme');
          localStorage.setItem('staffTrack_theme', 'dark');
        } else {
          document.body.classList.remove('dark-theme');
          localStorage.setItem('staffTrack_theme', 'light');
        }
      });
    }
  }

  /**
   * Initialize date displays
   */
  initDateDisplays() {
    const currentDateElement = document.getElementById('currentDate');
    const attendanceDateElement = document.getElementById('attendanceDate');
    
    if (currentDateElement) {
      currentDateElement.textContent = utils.formatDateLong(new Date());
    }
    
    if (attendanceDateElement) {
      attendanceDateElement.textContent = utils.formatDateLong(new Date());
    }
  }

  /**
   * Initialize filters
   */
  initFilters() {
    // Department filter
    const departmentFilter = document.getElementById('departmentFilter');
    if (departmentFilter) {
      departmentFilter.addEventListener('change', () => {
        this.renderEmployeesList();
      });
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        this.renderEmployeesList();
      });
    }
    
    // Sort by
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
      sortBy.addEventListener('change', () => {
        this.renderEmployeesList();
      });
    }
    
    // Employee search
    const employeeSearch = document.getElementById('employeeSearch');
    const searchEmployeesBtn = document.getElementById('searchEmployeesBtn');
    
    if (employeeSearch && searchEmployeesBtn) {
      // Search on enter key
      employeeSearch.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          this.renderEmployeesList();
        }
      });
      
      // Search on button click
      searchEmployeesBtn.addEventListener('click', () => {
        this.renderEmployeesList();
      });
    }
    
    // Punishment type filter
    const punishmentTypeFilter = document.getElementById('punishmentTypeFilter');
    if (punishmentTypeFilter) {
      punishmentTypeFilter.addEventListener('change', () => {
        this.renderPunishmentTable();
      });
    }
    
    // Punishment status filter
    const punishmentStatusFilter = document.getElementById('punishmentStatusFilter');
    if (punishmentStatusFilter) {
      punishmentStatusFilter.addEventListener('change', () => {
        this.renderPunishmentTable();
      });
    }
    
    // Attendance date filter
    const attendanceViewDate = document.getElementById('attendanceViewDate');
    if (attendanceViewDate) {
      // Set default value to today
      attendanceViewDate.value = utils.getTodayISO();
      
      attendanceViewDate.addEventListener('change', () => {
        this.renderAttendanceTable();
      });
    }
    
    // Mark attendance button
    const markAttendanceBtn = document.getElementById('markAttendanceBtn');
    if (markAttendanceBtn) {
      markAttendanceBtn.addEventListener('click', () => {
        // This would open a modal to mark attendance
        utils.showToast('This feature would allow marking attendance for today', 'info');
      });
    }
    
    // Attendance timeframe selector
    const attendanceTimeframe = document.getElementById('attendanceTimeframe');
    if (attendanceTimeframe) {
      attendanceTimeframe.addEventListener('change', () => {
        const period = attendanceTimeframe.value;
        chartService.createAttendanceChart(period);
      });
    }
    
    // Report timeframe selector
    const reportTimeframe = document.getElementById('reportTimeframe');
    const customDateRange = document.getElementById('customDateRange');
    
    if (reportTimeframe && customDateRange) {
      reportTimeframe.addEventListener('change', () => {
        if (reportTimeframe.value === 'custom') {
          customDateRange.style.display = 'block';
        } else {
          customDateRange.style.display = 'none';
        }
      });
    }
    
    // Generate report button
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
      generateReportBtn.addEventListener('click', () => {
        this.generateReport();
      });
    }
    
    // Refresh punishment stats button
    const refreshPunishmentStats = document.getElementById('refreshPunishmentStats');
    if (refreshPunishmentStats) {
      refreshPunishmentStats.addEventListener('click', () => {
        chartService.createPunishmentChart();
        utils.showToast('Punishment statistics updated', 'success');
      });
    }
  }

  /**
   * Initialize table actions
   */
  initTableActions() {
    // Pagination
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    if (prevPageBtn && nextPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        const currentPage = parseInt(document.getElementById('currentPage').textContent);
        if (currentPage > 1) {
          this.renderEmployeesList(currentPage - 1);
        }
      });
      
      nextPageBtn.addEventListener('click', () => {
        const currentPage = parseInt(document.getElementById('currentPage').textContent);
        const totalPages = parseInt(document.getElementById('totalPages').textContent);
        
        if (currentPage < totalPages) {
          this.renderEmployeesList(currentPage + 1);
        }
      });
    }
    
    // Import/Export buttons
    const importEmployeesBtn = document.getElementById('importEmployeesBtn');
    const exportEmployeesBtn = document.getElementById('exportEmployeesBtn');
    
    if (importEmployeesBtn) {
      importEmployeesBtn.addEventListener('click', () => {
        // In a real app, this would open a file dialog
        utils.showToast('Import functionality would open a file dialog', 'info');
      });
    }
    
    if (exportEmployeesBtn) {
      exportEmployeesBtn.addEventListener('click', () => {
        const employees = employeeService.getAllEmployees();
        utils.downloadJSON(employees, 'employees.json');
        utils.showToast('Employees data exported successfully', 'success');
      });
    }
  }

  /**
   * Initialize settings panel
   */
  initSettingsPanel() {
    const settingsMenuItems = document.querySelectorAll('.settings-menu li');
    
    settingsMenuItems.forEach(item => {
      item.addEventListener('click', () => {
        // Remove active class from all items
        settingsMenuItems.forEach(i => i.classList.remove('active'));
        
        // Add active class to clicked item
        item.classList.add('active');
        
        // Get settings panel ID
        const panelId = item.getAttribute('data-settings');
        
        // Hide all panels
        document.querySelectorAll('.settings-panel').forEach(panel => {
          panel.classList.remove('active');
        });
        
        // Show selected panel
        const panel = document.getElementById(panelId);
        if (panel) {
          panel.classList.add('active');
        }
      });
    });
    
    // General settings form
    const generalSettingsForm = document.getElementById('generalSettingsForm');
    if (generalSettingsForm) {
      generalSettingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const language = document.getElementById('systemLanguage').value;
        const dateFormat = document.getElementById('dateFormat').value;
        const timeFormat = document.getElementById('timeFormat').value;
        const autoLogout = document.getElementById('autoLogout').checked;
        
        // Save settings
        storageService.updateSettings('general', {
          language,
          dateFormat,
          timeFormat,
          autoLogout
        });
        
        utils.showToast('Settings saved successfully', 'success');
      });
    }
  }

  /**
   * Initialize report panel
   */
  initReportPanel() {
    const reportTypes = document.querySelectorAll('.report-types li');
    
    reportTypes.forEach(item => {
      item.addEventListener('click', () => {
        // Remove active class from all items
        reportTypes.forEach(i => i.classList.remove('active'));
        
        // Add active class to clicked item
        item.classList.add('active');
      });
    });
  }

  /**
   * Load settings from storage
   */
  loadSettings() {
    const generalSettings = storageService.getSettings('general');
    
    // Populate general settings form
    if (generalSettings) {
      const languageSelect = document.getElementById('systemLanguage');
      const dateFormatSelect = document.getElementById('dateFormat');
      const timeFormatSelect = document.getElementById('timeFormat');
      const autoLogoutCheck = document.getElementById('autoLogout');
      
      if (languageSelect) languageSelect.value = generalSettings.language || 'en';
      if (dateFormatSelect) dateFormatSelect.value = generalSettings.dateFormat || 'MM/DD/YYYY';
      if (timeFormatSelect) timeFormatSelect.value = generalSettings.timeFormat || '12';
      if (autoLogoutCheck) autoLogoutCheck.checked = generalSettings.autoLogout !== false;
    }
  }

  /**
   * Render dashboard statistics
   */
  renderDashboardStats() {
    // Get employees count
    const employees = employeeService.getAllEmployees();
    const totalEmployeesElement = document.getElementById('totalEmployees');
    if (totalEmployeesElement) {
      totalEmployeesElement.textContent = employees.length;
    }
    
    // Get today's attendance
    const today = utils.getTodayISO();
    const todayAttendance = attendanceService.getAttendanceByDate(today);
    const presentToday = todayAttendance.filter(record => 
      record.status === 'present' || record.status === 'late'
    ).length;
    
    const presentTodayElement = document.getElementById('presentToday');
    if (presentTodayElement) {
      presentTodayElement.textContent = presentToday;
    }
    
    // Get total payroll
    const totalPayroll = employeeService.getTotalSalary();
    const totalPayrollElement = document.getElementById('totalPayroll');
    if (totalPayrollElement) {
      totalPayrollElement.textContent = utils.formatCurrency(totalPayroll);
    }
    
    // Get active punishments
    const activePunishments = punishmentService.getActivePunishments();
    const activePunishmentsElement = document.getElementById('activePunishments');
    if (activePunishmentsElement) {
      activePunishmentsElement.textContent = activePunishments.length;
    }
    
    // Render activity list (simplified)
    this.renderActivityList();
  }

  /**
   * Render top performers
   */
  renderTopPerformers() {
    const topPerformers = employeeService.getTopPerformers(5);
    const topPerformersList = document.getElementById('topPerformersList');
    
    if (topPerformersList) {
      let html = '';
      
      topPerformers.forEach(employee => {
        // Convert performance score to star rating (1-5)
        const rating = Math.round(employee.performanceScore);
        let stars = '';
        
        for (let i = 0; i < 5; i++) {
          stars += `<svg viewBox="0 0 24 24" class="${i < rating ? 'filled' : ''}">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/>
          </svg>`;
        }
        
        html += `
          <li class="employee-item" data-id="${employee.id}">
            <div class="employee-avatar">
              <img src="${employee.imageUrl || 'https://i.pravatar.cc/150?img=30'}" alt="${employee.firstName}">
            </div>
            <div class="employee-info">
              <p class="employee-name">${employee.firstName} ${employee.lastName}</p>
              <p class="employee-position">${employee.position}</p>
            </div>
            <div class="employee-rating">
              ${stars}
            </div>
          </li>
        `;
      });
      
      topPerformersList.innerHTML = html;
      
      // Add click event to show employee details
      const employeeItems = topPerformersList.querySelectorAll('.employee-item');
      employeeItems.forEach(item => {
        item.addEventListener('click', () => {
          const employeeId = item.getAttribute('data-id');
          this.showEmployeeDetails(employeeId);
        });
      });
    }
  }

  /**
   * Render activity list
   */
  renderActivityList() {
    const activities = storageService.getAll('activity').slice(0, 10);
    const activityList = document.getElementById('activityList');
    
    if (activityList) {
      let html = '';
      
      activities.forEach(activity => {
        let iconClass = 'edit-icon';
        
        // Determine icon based on activity type
        if (activity.type.includes('added') || activity.type.includes('created')) {
          iconClass = 'add-icon';
        } else if (activity.type.includes('punishment')) {
          iconClass = 'punishment-icon';
        }
        
        html += `
          <li class="activity-item">
            <div class="activity-icon ${iconClass}">
              <svg viewBox="0 0 24 24">
                ${iconClass === 'add-icon' 
                  ? '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>'
                  : iconClass === 'punishment-icon'
                    ? '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/>'
                    : '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>'
                }
              </svg>
            </div>
            <div class="activity-content">
              <p>${activity.description}</p>
              <span class="activity-time">${utils.formatRelativeDate(activity.timestamp)}</span>
            </div>
          </li>
        `;
      });
      
      activityList.innerHTML = html;
    }
  }

  /**
   * Render employees list
   * @param {number} page - Page number
   */
  renderEmployeesList(page = 1) {
    // Get filter values
    const department = document.getElementById('departmentFilter')?.value || 'all';
    const status = document.getElementById('statusFilter')?.value || 'all';
    const sortBy = document.getElementById('sortBy')?.value || 'nameAsc';
    const searchQuery = document.getElementById('employeeSearch')?.value || '';
    
    // Get filtered employees
    const employees = employeeService.searchEmployees({
      department,
      status,
      sortBy,
      query: searchQuery
    });
    
    // Pagination
    const pageSize = 9;
    const totalPages = Math.ceil(employees.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const pagedEmployees = employees.slice(startIndex, startIndex + pageSize);
    
    // Update pagination info
    document.getElementById('currentPage').textContent = page;
    document.getElementById('totalPages').textContent = totalPages;
    
    // Disable/enable pagination buttons
    document.getElementById('prevPage').disabled = page <= 1;
    document.getElementById('nextPage').disabled = page >= totalPages;
    
    // Render employees
    const employeesGrid = document.getElementById('employeesGrid');
    if (employeesGrid) {
      let html = '';
      
      if (pagedEmployees.length === 0) {
        html = '<div class="no-results">No employees found</div>';
      } else {
        pagedEmployees.forEach(employee => {
          // Get status class
          let statusClass = 'status-active';
          if (employee.status === 'onLeave') {
            statusClass = 'status-pending';
          } else if (employee.status === 'suspended') {
            statusClass = 'status-inactive';
          }
          
          html += `
            <div class="employee-card" data-id="${employee.id}">
              <div class="employee-card-header">
                <div class="employee-card-avatar">
                  <img src="${employee.imageUrl || 'https://i.pravatar.cc/150?img=30'}" alt="${employee.firstName}">
                </div>
                <h3 class="employee-card-name">${employee.firstName} ${employee.lastName}</h3>
                <p class="employee-card-position">${employee.position}</p>
              </div>
              <div class="employee-card-info">
                <div class="employee-card-item">
                  <div class="employee-card-label">Department</div>
                  <div class="employee-card-value">${utils.capitalize(employee.department)}</div>
                </div>
                <div class="employee-card-item">
                  <div class="employee-card-label">Email</div>
                  <div class="employee-card-value">${employee.email}</div>
                </div>
                <div class="employee-card-item">
                  <div class="employee-card-label">Salary</div>
                  <div class="employee-card-value">${utils.formatCurrency(employee.salary)}</div>
                </div>
                <div class="employee-card-item">
                  <div class="employee-card-label">Status</div>
                  <div class="employee-card-value">
                    <span class="status-pill ${statusClass}">${utils.capitalize(employee.status)}</span>
                  </div>
                </div>
              </div>
              <div class="employee-card-actions">
                <button class="text-button view-details-btn">View Details</button>
                <button class="icon-button">
                  <svg viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/></svg>
                </button>
              </div>
            </div>
          `;
        });
      }
      
      employeesGrid.innerHTML = html;
      
      // Add event listeners to view details buttons
      const viewDetailsButtons = employeesGrid.querySelectorAll('.view-details-btn');
      viewDetailsButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const employeeCard = e.target.closest('.employee-card');
          const employeeId = employeeCard.getAttribute('data-id');
          this.showEmployeeDetails(employeeId);
        });
      });
      
      // Add event listeners to employee cards
      const employeeCards = employeesGrid.querySelectorAll('.employee-card');
      employeeCards.forEach(card => {
        card.addEventListener('click', (e) => {
          // Don't trigger if clicking a button
          if (e.target.closest('button')) return;
          
          const employeeId = card.getAttribute('data-id');
          this.showEmployeeDetails(employeeId);
        });
      });
    }
  }

  /**
   * Show employee details
   * @param {string} employeeId - Employee ID
   */
  showEmployeeDetails(employeeId) {
    const employee = employeeService.getEmployeeById(employeeId);
    if (!employee) return;
    
    // Get punishments
    const punishments = punishmentService.getEmployeePunishments(employeeId);
    
    // Get attendance (simplified)
    const dateRange = utils.getDateRange('thisMonth');
    const attendance = attendanceService.getAttendanceByDateRange(
      dateRange.startDate,
      dateRange.endDate
    ).filter(record => record.employeeId === employeeId);
    
    // Calculate stats
    const totalPunishmentAmount = punishments.reduce(
      (sum, punishment) => sum + (punishment.amount || 0), 
      0
    );
    
    // Create date strings
    const startDate = new Date(employee.startDate);
    const currentDate = new Date();
    const employmentDuration = Math.floor(
      (currentDate - startDate) / (1000 * 60 * 60 * 24 * 30)
    ); // Approximate months
    
    // Get status class
    let statusClass = 'status-active';
    if (employee.status === 'onLeave') {
      statusClass = 'status-pending';
    } else if (employee.status === 'suspended') {
      statusClass = 'status-inactive';
    }
    
    // Update modal content
    const detailContainer = document.querySelector('.employee-detail-container');
    if (detailContainer) {
      detailContainer.innerHTML = `
        <div class="employee-detail-sidebar">
          <div class="employee-card-avatar large">
            <img src="${employee.imageUrl || 'https://i.pravatar.cc/150?img=30'}" alt="${employee.firstName}">
          </div>
          <h2 class="employee-detail-name">${employee.firstName} ${employee.lastName}</h2>
          <p class="employee-detail-position">${employee.position}</p>
          <p class="employee-detail-dept">${utils.capitalize(employee.department)}</p>
          
          <div class="employee-detail-status">
            <span class="status-pill ${statusClass}">${utils.capitalize(employee.status)}</span>
          </div>
          
          <div class="employee-detail-stats">
            <div class="stat-item">
              <div class="stat-label">Time with Company</div>
              <div class="stat-value">${employmentDuration} months</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Current Punishments</div>
              <div class="stat-value">${punishments.filter(p => p.status === 'active').length}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Total Deductions</div>
              <div class="stat-value text-danger">${utils.formatCurrency(totalPunishmentAmount)}</div>
            </div>
          </div>
        </div>
        
        <div class="employee-detail-content">
          <div class="detail-section">
            <h3>Personal Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">Email</div>
                <div class="detail-value">${employee.email}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Phone</div>
                <div class="detail-value">${employee.phone || 'N/A'}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Address</div>
                <div class="detail-value">${employee.address || 'N/A'}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Start Date</div>
                <div class="detail-value">${utils.formatDate(employee.startDate)}</div>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Salary Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">Base Salary</div>
                <div class="detail-value">${utils.formatCurrency(employee.salary)}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Deductions (Current)</div>
                <div class="detail-value text-danger">${utils.formatCurrency(totalPunishmentAmount)}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Net Salary</div>
                <div class="detail-value">${utils.formatCurrency(employee.salary - totalPunishmentAmount)}</div>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Recent Punishments</h3>
            ${punishments.length === 0 ? '<p>No punishments found</p>' : `
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${punishments.slice(0, 3).map(punishment => `
                    <tr>
                      <td>${utils.formatDate(punishment.date)}</td>
                      <td>${utils.capitalize(punishment.type)}</td>
                      <td>${utils.formatCurrency(punishment.amount)}</td>
                      <td>
                        <span class="status-pill ${punishment.status === 'active' ? 'status-active' : punishment.status === 'pending' ? 'status-pending' : 'status-inactive'}">
                          ${utils.capitalize(punishment.status)}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          </div>
          
          <div class="detail-section">
            <h3>Recent Attendance</h3>
            ${attendance.length === 0 ? '<p>No attendance records found</p>' : `
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  ${attendance.slice(0, 5).map(record => `
                    <tr>
                      <td>${utils.formatDate(record.date)}</td>
                      <td>
                        <span class="status-pill ${
                          record.status === 'present' ? 'status-active' : 
                          record.status === 'late' ? 'status-pending' : 
                          record.status === 'absent' ? 'status-inactive' : 
                          'status-pending'
                        }">
                          ${utils.capitalize(record.status)}
                        </span>
                      </td>
                      <td>${record.checkIn ? utils.formatTime(record.checkIn) : '-'}</td>
                      <td>${record.checkOut ? utils.formatTime(record.checkOut) : '-'}</td>
                      <td>${record.hoursWorked || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          </div>
        </div>
      `;
    }
    
    // Set modal title
    const modalTitle = document.querySelector('#employeeDetailModal .modal-header h2');
    if (modalTitle) {
      modalTitle.textContent = `${employee.firstName} ${employee.lastName}`;
    }
    
    // Set delete button event
    const deleteBtn = document.getElementById('deleteEmployeeBtn');
    if (deleteBtn) {
      deleteBtn.setAttribute('data-id', employeeId);
      deleteBtn.onclick = () => {
        if (confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
          employeeService.deleteEmployee(employeeId);
          this.closeModal('employeeDetailModal');
          this.renderEmployeesList();
          utils.showToast('Employee deleted successfully', 'success');
        }
      };
    }
    
    // Set edit button event
    const editBtn = document.getElementById('editEmployeeBtn');
    if (editBtn) {
      editBtn.setAttribute('data-id', employeeId);
      editBtn.onclick = () => {
        utils.showToast('Edit functionality would be implemented here', 'info');
      };
    }
    
    // Open the modal
    this.openModal('employeeDetailModal');
  }

  /**
   * Render attendance table
   */
  renderAttendanceTable() {
    // Get date from date picker
    const datePicker = document.getElementById('attendanceViewDate');
    const selectedDate = datePicker ? datePicker.value : utils.getTodayISO();
    
    // Get attendance records for the date
    const records = attendanceService.getAttendanceByDate(selectedDate);
    
    // Get employees for lookup
    const employees = employeeService.getAllEmployees();
    const employeeMap = {};
    employees.forEach(emp => {
      employeeMap[emp.id] = emp;
    });
    
    // Update attendance date display
    const attendanceDateElement = document.getElementById('attendanceDate');
    if (attendanceDateElement) {
      attendanceDateElement.textContent = utils.formatDateLong(selectedDate);
    }
    
    // Update attendance stats
    const stats = attendanceService.getDateStatistics(selectedDate);
    
    document.getElementById('presentCount').textContent = stats.counts.present;
    document.getElementById('absentCount').textContent = stats.counts.absent;
    document.getElementById('lateCount').textContent = stats.counts.late;
    document.getElementById('leaveCount').textContent = stats.counts.leave;
    
    // Render table
    const tableBody = document.querySelector('#attendanceTable tbody');
    if (tableBody) {
      let html = '';
      
      if (records.length === 0) {
        html = `<tr><td colspan="8" class="no-results">No attendance records found for ${utils.formatDate(selectedDate)}</td></tr>`;
      } else {
        records.forEach(record => {
          const employee = employeeMap[record.employeeId];
          if (!employee) return;
          
          // Get status class
          let statusClass = 'status-active';
          if (record.status === 'late') {
            statusClass = 'status-pending';
          } else if (record.status === 'absent') {
            statusClass = 'status-inactive';
          } else if (record.status === 'leave') {
            statusClass = 'status-pending';
          }
          
          html += `
            <tr>
              <td>${record.employeeId}</td>
              <td>${employee.firstName} ${employee.lastName}</td>
              <td>${utils.capitalize(employee.department)}</td>
              <td>
                <span class="status-pill ${statusClass}">
                  ${utils.capitalize(record.status)}
                </span>
              </td>
              <td>${record.checkIn ? utils.formatTime(record.checkIn) : '-'}</td>
              <td>${record.checkOut ? utils.formatTime(record.checkOut) : '-'}</td>
              <td>${record.hoursWorked || '-'}</td>
              <td>
                <button class="icon-button" data-id="${record.id}">
                  <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                </button>
              </td>
            </tr>
          `;
        });
      }
      
      tableBody.innerHTML = html;
      
      // Add event listeners to edit buttons
      const editButtons = tableBody.querySelectorAll('.icon-button');
      editButtons.forEach(button => {
        button.addEventListener('click', () => {
          const recordId = button.getAttribute('data-id');
          // This would open an edit modal
          utils.showToast('Edit attendance functionality would be implemented here', 'info');
        });
      });
    }
  }

  /**
   * Render punishment table
   */
  renderPunishmentTable() {
    // Get filter values
    const typeFilter = document.getElementById('punishmentTypeFilter')?.value || 'all';
    const statusFilter = document.getElementById('punishmentStatusFilter')?.value || 'all';
    
    // Get date range (if any)
    const startDateInput = document.getElementById('punishmentStartDate');
    const endDateInput = document.getElementById('punishmentEndDate');
    
    let startDate = null;
    let endDate = null;
    
    if (startDateInput && startDateInput.value) {
      startDate = startDateInput.value;
    }
    
    if (endDateInput && endDateInput.value) {
      endDate = endDateInput.value;
    }
    
    // Get all punishments
    let punishments = punishmentService.getAllPunishments();
    
    // Apply filters
    if (typeFilter !== 'all') {
      punishments = punishments.filter(p => p.type === typeFilter);
    }
    
    if (statusFilter !== 'all') {
      punishments = punishments.filter(p => p.status === statusFilter);
    }
    
    if (startDate && endDate) {
      punishments = punishments.filter(p => 
        p.date >= startDate && p.date <= endDate
      );
    }
    
    // Sort by date (most recent first)
    punishments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get employees for lookup
    const employees = employeeService.getAllEmployees();
    const employeeMap = {};
    employees.forEach(emp => {
      employeeMap[emp.id] = emp;
    });
    
    // Render table
    const tableBody = document.querySelector('#punishmentTable tbody');
    if (tableBody) {
      let html = '';
      
      if (punishments.length === 0) {
        html = `<tr><td colspan="8" class="no-results">No punishments found</td></tr>`;
      } else {
        punishments.forEach(punishment => {
          const employee = employeeMap[punishment.employeeId];
          if (!employee) return;
          
          // Get status class
          let statusClass = 'status-active';
          if (punishment.status === 'pending') {
            statusClass = 'status-pending';
          } else if (punishment.status === 'completed') {
            statusClass = 'status-inactive';
          }
          
          html += `
            <tr>
              <td>${punishment.id}</td>
              <td>${employee.firstName} ${employee.lastName}</td>
              <td>${utils.capitalize(punishment.type)}</td>
              <td>${punishment.description}</td>
              <td>${utils.formatDate(punishment.date)}</td>
              <td>${utils.formatCurrency(punishment.amount)}</td>
              <td>
                <span class="status-pill ${statusClass}">
                  ${utils.capitalize(punishment.status)}
                </span>
              </td>
              <td>
                <button class="icon-button edit-btn" data-id="${punishment.id}">
                  <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                </button>
                <button class="icon-button delete-btn" data-id="${punishment.id}">
                  <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>
                </button>
              </td>
            </tr>
          `;
        });
      }
      
      tableBody.innerHTML = html;
      
      // Add event listeners to edit buttons
      const editButtons = tableBody.querySelectorAll('.edit-btn');
      editButtons.forEach(button => {
        button.addEventListener('click', () => {
          const punishmentId = button.getAttribute('data-id');
          // This would open an edit modal
          utils.showToast('Edit punishment functionality would be implemented here', 'info');
        });
      });
      
      // Add event listeners to delete buttons
      const deleteButtons = tableBody.querySelectorAll('.delete-btn');
      deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
          const punishmentId = button.getAttribute('data-id');
          const punishment = punishmentService.getPunishmentById(punishmentId);
          const employee = employeeMap[punishment.employeeId];
          
          if (confirm(`Are you sure you want to delete this punishment for ${employee.firstName} ${employee.lastName}?`)) {
            punishmentService.deletePunishment(punishmentId);
            this.renderPunishmentTable();
            utils.showToast('Punishment deleted successfully', 'success');
          }
        });
      });
    }
  }

  /**
   * Populate punishment employees dropdown
   */
  populatePunishmentEmployees() {
    const select = document.getElementById('punishmentEmployee');
    if (!select) return;
    
    // Get employees
    const employees = employeeService.getAllEmployees();
    
    // Clear existing options (keeping the default)
    select.innerHTML = '<option value="">Select Employee</option>';
    
    // Add employee options
    employees.forEach(employee => {
      const option = document.createElement('option');
      option.value = employee.id;
      option.textContent = `${employee.firstName} ${employee.lastName}`;
      select.appendChild(option);
    });
  }

  /**
   * Save a new employee
   */
  saveEmployee() {
    // Get form values
    const firstName = document.getElementById('employeeFirstName').value;
    const lastName = document.getElementById('employeeLastName').value;
    const email = document.getElementById('employeeEmail').value;
    const phone = document.getElementById('employeePhone').value;
    const department = document.getElementById('employeeDepartment').value;
    const position = document.getElementById('employeePosition').value;
    const startDate = document.getElementById('employeeStartDate').value;
    const salary = parseFloat(document.getElementById('employeeSalary').value);
    const address = document.getElementById('employeeAddress').value;
    const status = document.getElementById('employeeStatus').checked ? 'active' : 'inactive';
    
    // Validate required fields
    if (!firstName || !lastName || !email || !department || !position || !startDate || isNaN(salary)) {
      utils.showToast('Please fill in all required fields', 'error');
      return;
    }
    
    // Validate email
    if (!utils.isValidEmail(email)) {
      utils.showToast('Please enter a valid email address', 'error');
      return;
    }
    
    // Create employee
    const employeeData = {
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      startDate,
      salary,
      address,
      status,
      imageUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` // Random avatar
    };
    
    // Show loading
    utils.toggleLoading(true);
    
    // Save employee (with a small delay to show loading)
    setTimeout(() => {
      try {
        const newEmployee = employeeService.createEmployee(employeeData);
        
        // Reset form
        document.getElementById('addEmployeeForm').reset();
        
        // Close modal
        this.closeModal('addEmployeeModal');
        
        // Show success message
        utils.showToast('Employee added successfully', 'success');
        
        // Re-render employees list if visible
        if (this.currentSection === 'employees') {
          this.renderEmployeesList();
        }
        
        // Update dashboard stats
        this.renderDashboardStats();
      } catch (error) {
        utils.showToast('Error adding employee: ' + error.message, 'error');
      } finally {
        utils.toggleLoading(false);
      }
    }, 500);
  }

  /**
   * Save a new punishment
   */
  savePunishment() {
    // Get form values
    const employeeId = document.getElementById('punishmentEmployee').value;
    const type = document.getElementById('punishmentType').value;
    const date = document.getElementById('punishmentDate').value;
    const amount = parseFloat(document.getElementById('punishmentAmount').value);
    const description = document.getElementById('punishmentDescription').value;
    
    // Validate required fields
    if (!employeeId || !type || !date || isNaN(amount) || !description) {
      utils.showToast('Please fill in all required fields', 'error');
      return;
    }
    
    // Create punishment
    const punishmentData = {
      employeeId,
      type,
      date,
      amount,
      description,
      status: 'active'
    };
    
    // Show loading
    utils.toggleLoading(true);
    
    // Save punishment (with a small delay to show loading)
    setTimeout(() => {
      try {
        const newPunishment = punishmentService.createPunishment(punishmentData);
        
        // Reset form
        document.getElementById('addPunishmentForm').reset();
        
        // Close modal
        this.closeModal('addPunishmentModal');
        
        // Show success message
        utils.showToast('Punishment added successfully', 'success');
        
        // Re-render punishment table if visible
        if (this.currentSection === 'punishments') {
          this.renderPunishmentTable();
        }
        
        // Update dashboard stats and charts
        this.renderDashboardStats();
        chartService.createPunishmentChart();
      } catch (error) {
        utils.showToast('Error adding punishment: ' + error.message, 'error');
      } finally {
        utils.toggleLoading(false);
      }
    }, 500);
  }

  /**
   * Generate a report
   */
  generateReport() {
    // Get report type
    const reportType = document.querySelector('.report-types li.active')?.getAttribute('data-report');
    if (!reportType) {
      utils.showToast('Please select a report type', 'error');
      return;
    }
    
    // Get timeframe
    const timeframe = document.getElementById('reportTimeframe').value;
    let startDate, endDate;
    
    if (timeframe === 'custom') {
      startDate = document.getElementById('reportStartDate').value;
      endDate = document.getElementById('reportEndDate').value;
      
      if (!startDate || !endDate) {
        utils.showToast('Please select a date range', 'error');
        return;
      }
    } else {
      const dateRange = utils.getDateRange(timeframe);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }
    
    // Get format
    const format = document.getElementById('reportFormat').value;
    
    // Show loading
    utils.toggleLoading(true);
    
    // Generate report (with a small delay to show loading)
    setTimeout(() => {
      try {
        let report;
        
        // Generate report based on type
        switch (reportType) {
          case 'attendanceSummary':
            report = reportService.generateAttendanceSummary(startDate, endDate);
            break;
          case 'salaryReport':
            report = reportService.generateSalaryReport(startDate, endDate);
            break;
          case 'punishmentReport':
            report = reportService.generatePunishmentReport(startDate, endDate);
            break;
          case 'departmentPerformance':
            report = reportService.generateDepartmentPerformance(startDate, endDate);
            break;
          case 'employeeActivity':
            report = reportService.generateEmployeeActivity(startDate, endDate);
            break;
          case 'customReport':
            report = reportService.generateCustomReport({
              startDate,
              endDate,
              format
            });
            break;
          default:
            throw new Error('Unknown report type');
        }
        
        // Display report
        this.displayReport(report, format);
        
        // Show success message
        utils.showToast('Report generated successfully', 'success');
      } catch (error) {
        utils.showToast('Error generating report: ' + error.message, 'error');
      } finally {
        utils.toggleLoading(false);
      }
    }, 800);
  }

  /**
   * Display a report
   * @param {Object} report - Report data
   * @param {string} format - Display format ('table', 'chart', 'both')
   */
  displayReport(report, format) {
    const reportContent = document.getElementById('reportContent');
    if (!reportContent) return;
    
    let html = '';
    
    // Report header
    html += `
      <div class="report-header">
        <h2>${this.getReportTitle(report.reportType)}</h2>
        <p class="report-period">Period: ${utils.formatDate(report.period.startDate)} to ${utils.formatDate(report.period.endDate)}</p>
      </div>
    `;
    
    // Report format depends on report type
    switch (report.reportType) {
      case 'attendance_summary':
        html += this.formatAttendanceReport(report, format);
        break;
      case 'salary_report':
        html += this.formatSalaryReport(report, format);
        break;
      case 'punishment_report':
        html += this.formatPunishmentReport(report, format);
        break;
      case 'department_performance':
        html += this.formatDepartmentReport(report, format);
        break;
      case 'employee_activity':
        html += this.formatActivityReport(report, format);
        break;
      default:
        html += `<p>Report type not supported for display</p>`;
        break;
    }
    
    // Set content
    reportContent.innerHTML = html;
    
    // Initialize charts if needed
    if (format === 'chart' || format === 'both') {
      this.initReportCharts(report);
    }
  }

  /**
   * Get report title
   * @param {string} reportType - Report type
   * @returns {string} - Report title
   */
  getReportTitle(reportType) {
    switch (reportType) {
      case 'attendance_summary':
        return 'Attendance Summary Report';
      case 'salary_report':
        return 'Salary Report';
      case 'punishment_report':
        return 'Punishment Report';
      case 'department_performance':
        return 'Department Performance Report';
      case 'employee_activity':
        return 'Employee Activity Report';
      case 'custom_report':
        return 'Custom Report';
      default:
        return 'Report';
    }
  }

  /**
   * Format attendance report
   * @param {Object} report - Report data
   * @param {string} format - Display format
   * @returns {string} - HTML content
   */
  formatAttendanceReport(report, format) {
    let html = '';
    
    // Overall statistics
    html += `
      <div class="report-section">
        <h3>Overall Statistics</h3>
        <div class="report-stats">
          <div class="report-stat">
            <div class="stat-value">${report.overall.totalEmployees}</div>
            <div class="stat-label">Total Employees</div>
          </div>
          <div class="report-stat">
            <div class="stat-value">${report.overall.attendanceRate}%</div>
            <div class="stat-label">Attendance Rate</div>
          </div>
          <div class="report-stat">
            <div class="stat-value">${report.overall.statusCounts.present}</div>
            <div class="stat-label">Present</div>
          </div>
          <div class="report-stat">
            <div class="stat-value">${report.overall.statusCounts.absent}</div>
            <div class="stat-label">Absent</div>
          </div>
          <div class="report-stat">
            <div class="stat-value">${report.overall.statusCounts.late}</div>
            <div class="stat-label">Late</div>
          </div>
        </div>
      </div>
    `;
    
    // Include chart if format is 'chart' or 'both'
    if (format === 'chart' || format === 'both') {
      html += `
        <div class="report-section">
          <h3>Attendance Trends</h3>
          <div class="report-chart">
            <canvas id="reportAttendanceChart" height="300"></canvas>
          </div>
        </div>
      `;
    }
    
    // Include table if format is 'table' or 'both'
    if (format === 'table' || format === 'both') {
      html += `
        <div class="report-section">
          <h3>Employee Attendance</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Attendance Rate</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              ${report.employeeStats.map(emp => `
                <tr>
                  <td>${emp.name}</td>
                  <td>${utils.capitalize(emp.department)}</td>
                  <td>${emp.statusCounts.present}</td>
                  <td>${emp.statusCounts.absent}</td>
                  <td>${emp.statusCounts.late}</td>
                  <td>${emp.attendanceRate}%</td>
                  <td>${emp.totalHours}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    
    return html;
  }

  /**
   * Format salary report
   * @param {Object} report - Report data
   * @param {string} format - Display format
   * @returns {string} - HTML content
   */
  formatSalaryReport(report, format) {
    let html = '';
    
    // Overall statistics
    html += `
      <div class="report-section">
        <h3>Overall Statistics</h3>
        <div class="report-stats">
          <div class="report-stat">
            <div class="stat-value">${report.overall.totalEmployees}</div>
            <div class="stat-label">Total Employees</div>
          </div>
          <div class="report-stat">
            <div class="stat-value">${utils.formatCurrency(report.overall.totalBaseSalary)}</div>
            <div class="stat-label">Total Base Salary</div>
          </div>
          <div class="report-stat">
            <div class="stat-value">${utils.formatCurrency(report.overall.totalDeductions)}</div>
            <div class="stat-label">Total Deductions</div>
          </div>
          <div class="report-stat">
            <div class="stat-value">${utils.formatCurrency(report.overall.totalNetSalary)}</div>
            <div class="stat-label">Total Net Salary</div>
          </div>
          <div class="report-stat">
            <div class="stat-value">${report.overall.overallDeductionPercentage}%</div>
            <div class="stat-label">Deduction Rate</div>
          </div>
        </div>
      </div>
    `;
    
    // Include chart if format is 'chart' or 'both'
    if (format === 'chart' || format === 'both') {
      html += `
        <div class="report-section">
          <h3>Department Salary Distribution</h3>
          <div class="report-chart">
            <canvas id="reportSalaryChart" height="300"></canvas>
          </div>
        </div>
      `;
    }
    
    // Include table if format is 'table' or 'both'
    if (format === 'table' || format === 'both') {
      html += `
        <div class="report-section">
          <h3>Employee Salaries</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Position</th>
                <th>Base Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Deduction %</th>
              </tr>
            </thead>
            <tbody>
              ${report.employeeSalaries.map(emp => `
                <tr>
                  <td>${emp.name}</td>
                  <td>${utils.capitalize(emp.department)}</td>
                  <td>${emp.position}</td>
                  <td>${utils.formatCurrency(emp.baseSalary)}</td>
                  <td>${utils.formatCurrency(emp.deductions)}</td>
                  <td>${utils.formatCurrency(emp.netSalary)}</td>
                  <td>${emp.deductionPercentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    
    return html;
  }

  /**
   * Format punishment report
   * @param {Object} report - Report data
   * @param {string} format - Display format
   * @returns {string} - HTML content
   */
  formatPunishmentReport(report, format) {
    let html = '';
    
    // Overall statistics
    html += `
      <div class="report-section">
        <h3>Overall Statistics</h3>
        <div class="report-stats">
          <div class="report-stat">
            <div class="stat-value">${report.overall.totalCount}</div>
            <div class="stat-label">Total Punishments</div>
          </div>
          <div class="report-stat">
            <div class="stat-value">${utils.formatCurrency(report.overall.totalAmount)}</div>
            <div class="stat-label">Total Amount</div>
          </div>
          <div class="report-stat">
            <div class="stat-value">${report.overall.byStatus.active.count}</div>
            <div class="stat-label">Active Punishments</div>
          </div>
          <div class="report-stat">
            <div class="stat-value">${report.overall.byStatus.completed.count}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
      </div>
    `;
    
    // Include chart if format is 'chart' or 'both'
    if (format === 'chart' || format === 'both') {
      html += `
        <div class="report-section">
          <h3>Punishment Distribution</h3>
          <div class="report-charts">
            <div class="report-chart-half">
              <h4>By Count</h4>
              <canvas id="punishmentCountChart" height="250"></canvas>
            </div>
            <div class="report-chart-half">
              <h4>By Amount</h4>
              <canvas id="punishmentAmountChart" height="250"></canvas>
            </div>
          </div>
        </div>
      `;
    }
    
    // Include table if format is 'table' or 'both'
    if (format === 'table' || format === 'both') {
      html += `
        <div class="report-section">
          <h3>Punishment Records</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${report.detailedRecords.map(record => `
                <tr>
                  <td>${utils.formatDate(record.date)}</td>
                  <td>${record.employeeName}</td>
                  <td>${utils.capitalize(record.department)}</td>
                  <td>${record.typeName}</td>
                  <td>${utils.formatCurrency(record.amount)}</td>
                  <td>${utils.capitalize(record.status)}</td>
                  <td>${record.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    
    return html;
  }

  /**
   * Format department report
   * @param {Object} report - Report data
   * @param {string} format - Display format
   * @returns {string} - HTML content
   */
  formatDepartmentReport(report, format) {
    let html = '';
    
    // Include chart if format is 'chart' or 'both'
    if (format === 'chart' || format === 'both') {
      html += `
        <div class="report-section">
          <h3>Department Performance</h3>
          <div class="report-chart">
            <canvas id="departmentPerformanceChart" height="300"></canvas>
          </div>
        </div>
      `;
    }
    
    // Include table if format is 'table' or 'both'
    if (format === 'table' || format === 'both') {
      html += `
        <div class="report-section">
          <h3>Department Details</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Employees</th>
                <th>Attendance Rate</th>
                <th>Punishments</th>
                <th>Avg. Salary</th>
                <th>Performance Score</th>
              </tr>
            </thead>
            <tbody>
              ${report.departmentPerformance.map(dept => `
                <tr>
                  <td>${utils.capitalize(dept.name)}</td>
                  <td>${dept.employeeCount}</td>
                  <td>${dept.attendance.attendanceRate}%</td>
                  <td>${dept.punishments.total}</td>
                  <td>${utils.formatCurrency(dept.salary.average)}</td>
                  <td>${dept.performanceScore}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    
    return html;
  }

  /**
   * Format activity report
   * @param {Object} report - Report data
   * @param {string} format - Display format
   * @returns {string} - HTML content
   */
  formatActivityReport(report, format) {
    let html = '';
    
    // Overall statistics
    html += `
      <div class="report-section">
        <h3>Activity Summary</h3>
        <div class="report-stats">
          <div class="report-stat">
            <div class="stat-value">${report.overall.totalActivities}</div>
            <div class="stat-label">Total Activities</div>
          </div>
        </div>
      </div>
    `;
    
    // Include chart if format is 'chart' or 'both'
    if (format === 'chart' || format === 'both') {
      html += `
        <div class="report-section">
          <h3>Activity Timeline</h3>
          <div class="report-chart">
            <canvas id="activityTimelineChart" height="300"></canvas>
          </div>
        </div>
      `;
    }
    
    // Include table if format is 'table' or 'both'
    if (format === 'table' || format === 'both') {
      html += `
        <div class="report-section">
          <h3>Activity Log</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${report.activities.map(activity => `
                <tr>
                  <td>${new Date(activity.timestamp).toLocaleString()}</td>
                  <td>${activity.type.replace(/_/g, ' ')}</td>
                  <td>${activity.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    
    return html;
  }

  /**
   * Initialize report charts
   * @param {Object} report - Report data
   */
  initReportCharts(report) {
    switch (report.reportType) {
      case 'attendance_summary':
        this.initAttendanceReportChart(report);
        break;
      case 'salary_report':
        this.initSalaryReportChart(report);
        break;
      case 'punishment_report':
        this.initPunishmentReportCharts(report);
        break;
      case 'department_performance':
        this.initDepartmentPerformanceChart(report);
        break;
      case 'employee_activity':
        this.initActivityTimelineChart(report);
        break;
    }
  }

  /**
   * Initialize attendance report chart
   * @param {Object} report - Report data
   */
  initAttendanceReportChart(report) {
    const dailyStats = report.dailyStats;
    const labels = dailyStats.map(day => utils.formatDate(day.date));
    const presentData = dailyStats.map(day => day.statusCounts.present);
    const lateData = dailyStats.map(day => day.statusCounts.late);
    const absentData = dailyStats.map(day => day.statusCounts.absent);
    const leaveData = dailyStats.map(day => day.statusCounts.leave);
    
    const datasets = [
      {
        label: 'Present',
        data: presentData,
        backgroundColor: '#30D158', // accent
        borderColor: '#30D158',
        borderWidth: 1
      },
      {
        label: 'Late',
        data: lateData,
        backgroundColor: '#FF9F0A', // warning
        borderColor: '#FF9F0A',
        borderWidth: 1
      },
      {
        label: 'Absent',
        data: absentData,
        backgroundColor: '#FF3B30', // danger
        borderColor: '#FF3B30',
        borderWidth: 1
      },
      {
        label: 'Leave',
        data: leaveData,
        backgroundColor: '#5E5CE6', // secondary
        borderColor: '#5E5CE6',
        borderWidth: 1
      }
    ];
    
    chartService.createBarChart('reportAttendanceChart', labels, datasets, {
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          beginAtZero: true
        }
      }
    });
  }

  /**
   * Initialize salary report chart
   * @param {Object} report - Report data
   */
  initSalaryReportChart(report) {
    // Prepare department data
    const departments = Object.keys(report.departmentSummary);
    const baseSalaryData = departments.map(dept => 
      report.departmentSummary[dept].totalBaseSalary
    );
    const deductionsData = departments.map(dept => 
      report.departmentSummary[dept].totalDeductions
    );
    
    // Format department names
    const labels = departments.map(dept => utils.capitalize(dept));
    
    const datasets = [
      {
        label: 'Base Salary',
        data: baseSalaryData,
        backgroundColor: '#0A84FF', // primary
        borderColor: '#0A84FF',
        borderWidth: 1
      },
      {
        label: 'Deductions',
        data: deductionsData,
        backgroundColor: '#FF3B30', // danger
        borderColor: '#FF3B30',
        borderWidth: 1
      }
    ];
    
    chartService.createBarChart('reportSalaryChart', labels, datasets);
  }

  /**
   * Initialize punishment report charts
   * @param {Object} report - Report data
   */
  initPunishmentReportCharts(report) {
    // Prepare data for count chart
    const typeLabels = Object.keys(report.overall.byType)
      .filter(type => report.overall.byType[type].count > 0)
      .map(type => report.overall.byType[type].name);
    
    const countData = Object.keys(report.overall.byType)
      .filter(type => report.overall.byType[type].count > 0)
      .map(type => report.overall.byType[type].count);
    
    const amountData = Object.keys(report.overall.byType)
      .filter(type => report.overall.byType[type].count > 0)
      .map(type => report.overall.byType[type].amount);
    
    // Chart colors
    const colors = [
      '#FF9F0A', // warning
      '#FF3B30', // danger
      '#5E5CE6', // secondary
      '#FF2D55', // pink
      '#64D2FF'  // info
    ];
    
    // Create charts
    chartService.createPieChart('punishmentCountChart', typeLabels, countData, colors);
    chartService.createPieChart('punishmentAmountChart', typeLabels, amountData, colors);
  }

  /**
   * Initialize department performance chart
   * @param {Object} report - Report data
   */
  initDepartmentPerformanceChart(report) {
    const departments = report.departmentPerformance.map(dept => utils.capitalize(dept.name));
    const scores = report.departmentPerformance.map(dept => dept.performanceScore);
    const attendanceRates = report.departmentPerformance.map(dept => dept.attendance.attendanceRate);
    const punishmentsPerEmployee = report.departmentPerformance.map(dept => dept.punishments.perEmployee);
    
    const datasets = [
      {
        label: 'Performance Score',
        data: scores,
        backgroundColor: '#0A84FF', // primary
        borderColor: '#0A84FF',
        borderWidth: 1,
        type: 'bar'
      },
      {
        label: 'Attendance Rate (%)',
        data: attendanceRates,
        backgroundColor: '#30D158', // accent
        borderColor: '#30D158',
        borderWidth: 2,
        type: 'line',
        yAxisID: 'y1'
      },
      {
        label: 'Punishments Per Employee',
        data: punishmentsPerEmployee,
        backgroundColor: '#FF3B30', // danger
        borderColor: '#FF3B30',
        borderWidth: 2,
        type: 'line',
        yAxisID: 'y1'
      }
    ];
    
    // Custom chart with mixed types
    const canvas = document.getElementById('departmentPerformanceChart');
    if (!canvas || !window.Chart) return;
    
    // Destroy existing chart
    if (chartService.charts.departmentPerformanceChart) {
      chartService.charts.departmentPerformanceChart.destroy();
    }
    
    // Create new chart
    chartService.charts.departmentPerformanceChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: departments,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Performance Score'
            }
          },
          y1: {
            position: 'right',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Rate (%)'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  /**
   * Initialize activity timeline chart
   * @param {Object} report - Report data
   */
  initActivityTimelineChart(report) {
    const labels = report.timeline.dates.map(date => utils.formatDate(date));
    const counts = report.timeline.counts;
    
    const datasets = [
      {
        label: 'Activities',
        data: counts,
        fill: false,
        backgroundColor: '#0A84FF', // primary
        borderColor: '#0A84FF',
        tension: 0.4
      }
    ];
    
    chartService.createLineChart('activityTimelineChart', labels, datasets);
  }
}

// Create UI service singleton
const uiService = new UIService();