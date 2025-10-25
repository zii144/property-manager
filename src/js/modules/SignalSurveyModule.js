import { Module } from "../core/Module.js";

/**
 * Signal Survey JSON to Excel Module
 * Convert signal survey JSON data to Excel-friendly table format
 */
export class SignalSurveyModule extends Module {
  constructor() {
    super(
      "signal-survey",
      "Signal Survey Converter",
      "Convert signal survey JSON data to Excel format"
    );
    this.icon = "🚦";
    this.jsonData = null;
    this.tableData = [];
    this.headers = [];
    this.isValidJson = false;
    this.filteredData = null;
    this.sortedData = null;
    this.dataTypeStats = null;

    // Performance optimization properties
    this.currentPage = 1;
    this.pageSize = 100;
    this.totalPages = 1;
    this.isProcessing = false;
  }

  /**
   * Initialize the module
   */
  init() {
    this.setupEventListeners();
  }

  /**
   * Render the module's HTML
   */
  render() {
    const container = document.createElement("div");
    container.className = "module-content";
    container.innerHTML = `
      <div class="signal-survey-converter">
        <div class="converter-header">
          <h2 class="converter-title">Signal Survey JSON to Excel Converter</h2>
          <div class="converter-info">
            <span class="info-text">Convert signal survey data from JSON to Excel format</span>
          </div>
        </div>

        <div class="input-section">
          <div class="json-input-group">
            <label for="signalJsonInput" class="input-label">Paste your Signal Survey JSON data:</label>
            <textarea 
              id="signalJsonInput" 
              class="json-input" 
              placeholder="Paste your signal survey JSON data here...&#10;&#10;Example:&#10;{&#10;  &quot;path&quot;: &quot;users/userId&quot;,&#10;  &quot;data&quot;: {&#10;    &quot;missionsCompleted&quot;: 0,&#10;    &quot;statistics&quot;: {&#10;      &quot;totalSignalPoles&quot;: 0,&#10;      &quot;threeColorIntersections&quot;: 0&#10;    }&#10;  }&#10;}"
              rows="15"
            ></textarea>
            <div class="json-status" id="signalJsonStatus">
              <span class="status-icon">⏳</span>
              <span class="status-text">Ready to convert</span>
            </div>
          </div>

          <div class="conversion-options">
            <h3 class="options-title">Conversion Options</h3>
            <div class="options-grid">
              <div class="option-group">
                <label class="option-label">
                  <input type="checkbox" id="flattenStatistics" checked>
                  <span class="checkmark"></span>
                  Flatten statistics
                </label>
                <p class="option-description">Convert statistics object to individual columns</p>
              </div>
              <div class="option-group">
                <label class="option-label">
                  <input type="checkbox" id="formatTimestamps" checked>
                  <span class="checkmark"></span>
                  Format timestamps
                </label>
                <p class="option-description">Convert Firestore timestamps to readable dates</p>
              </div>
              <div class="option-group">
                <label class="option-label">
                  <input type="checkbox" id="includeMetadata" checked>
                  <span class="checkmark"></span>
                  Include metadata
                </label>
                <p class="option-description">Include path and readTime information</p>
              </div>
              <div class="option-group">
                <label class="option-label">
                  <input type="checkbox" id="createSummaryRow" checked>
                  <span class="checkmark"></span>
                  Create summary row
                </label>
                <p class="option-description">Add a summary row with totals</p>
              </div>
            </div>
          </div>

          <div class="conversion-actions">
            <button id="signalConvertBtn" class="btn btn-primary">
              <svg class="convert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              Convert to Excel
            </button>
            <button id="signalClearBtn" class="btn btn-secondary">
              <svg class="clear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
              Clear
            </button>
            <button id="signalValidateBtn" class="btn btn-validate">
              <svg class="validate-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              Validate JSON
            </button>
            <button id="loadExampleBtn" class="btn btn-example">
              <svg class="example-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"></path>
                <rect x="9" y="7" width="6" height="4"></rect>
                <path d="M15 7V5a2 2 0 0 0-2-2H11a2 2 0 0 0-2 2v2"></path>
              </svg>
              Load Example
            </button>
          </div>
        </div>

        <div class="preview-section" id="signalPreviewSection" style="display: none;">
          <div class="preview-header">
            <h3 class="preview-title">Excel Table Preview</h3>
            <div class="preview-actions">
              <button id="signalCopyTableBtn" class="btn btn-copy">
                <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy Table
              </button>
              <div class="export-dropdown">
                <button id="signalExportBtn" class="btn btn-download">
                  <svg class="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Export Data
                  <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </button>
                <div class="export-menu" id="signalExportMenu">
                  <button id="signalDownloadCsvBtn" class="export-option">
                    <svg class="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                    </svg>
                    Download CSV
                  </button>
                  <button id="signalDownloadJsonBtn" class="export-option">
                    <svg class="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                    </svg>
                    Download JSON
                  </button>
                  <button id="signalDownloadTxtBtn" class="export-option">
                    <svg class="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                    </svg>
                    Download TXT
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="table-controls" id="signalTableControls" style="display: none;">
            <div class="control-group">
              <label for="signalFilterColumn" class="control-label">Filter by column:</label>
              <select id="signalFilterColumn" class="control-select">
                <option value="">All columns</option>
              </select>
              <input type="text" id="signalFilterValue" class="control-input" placeholder="Filter value...">
              <button id="signalApplyFilter" class="btn btn-small">Apply Filter</button>
              <button id="signalClearFilter" class="btn btn-small btn-secondary">Clear</button>
            </div>
            <div class="control-group">
              <label for="signalSortColumn" class="control-label">Sort by:</label>
              <select id="signalSortColumn" class="control-select">
                <option value="">No sorting</option>
              </select>
              <select id="signalSortOrder" class="control-select">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
              <button id="signalApplySort" class="btn btn-small">Apply Sort</button>
            </div>
          </div>
          
          <div class="table-info">
            <div class="table-stats">
              <span class="stat-item">
                <strong>Records:</strong> <span id="signalRowCount">0</span>
              </span>
              <span class="stat-item">
                <strong>Columns:</strong> <span id="signalColumnCount">0</span>
              </span>
              <span class="stat-item">
                <strong>Data Type:</strong> <span id="signalDataType">-</span>
              </span>
              <span class="stat-item">
                <strong>Page Size:</strong> 
                <select id="signalPageSize" class="page-size-select">
                  <option value="50">50</option>
                  <option value="100" selected>100</option>
                  <option value="200">200</option>
                  <option value="500">500</option>
                  <option value="1000">1000</option>
                </select>
              </span>
            </div>
          </div>

          <div class="pagination-controls" id="signalPaginationControls" style="display: none;">
            <div class="pagination-info">
              <span>Page <span id="signalCurrentPage">1</span> of <span id="signalTotalPages">1</span></span>
              <span class="pagination-stats">
                Showing <span id="signalStartRecord">1</span> to <span id="signalEndRecord">100</span> of <span id="signalTotalRecords">0</span> records
              </span>
            </div>
            <div class="pagination-buttons">
              <button id="signalFirstPage" class="btn btn-small" disabled>
                <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="11,17 6,12 11,7"></polyline>
                  <polyline points="18,17 13,12 18,7"></polyline>
                </svg>
                First
              </button>
              <button id="signalPrevPage" class="btn btn-small" disabled>
                <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
                Previous
              </button>
              <button id="signalNextPage" class="btn btn-small" disabled>
                Next
                <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
              <button id="signalLastPage" class="btn btn-small" disabled>
                Last
                <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="13,17 18,12 13,7"></polyline>
                  <polyline points="6,17 11,12 6,7"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <div class="table-container">
            <div class="table-wrapper">
              <table class="data-table" id="signalDataTable">
                <thead id="signalTableHead"></thead>
                <tbody id="signalTableBody"></tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="examples-section">
          <h3 class="examples-title">Signal Survey Data Examples</h3>
          <div class="examples-grid">
            <div class="example-card" data-example="users">
              <h4>🚦 Users Data</h4>
              <p>Load real user statistics and mission data</p>
              <div class="example-code">
                <code>4 users with statistics and roles</code>
              </div>
              <button class="load-example-btn">Load Users Data</button>
            </div>
            <div class="example-card" data-example="reports">
              <h4>📋 Reports Data</h4>
              <p>Load real survey reports with answers</p>
              <div class="example-code">
                <code>381 reports with intersection data</code>
              </div>
              <button class="load-example-btn">Load Reports Data</button>
            </div>
            <div class="example-card" data-example="report-notes">
              <h4>📝 Report Notes</h4>
              <p>Load real notes with images and questions</p>
              <div class="example-code">
                <code>258 note records with image data</code>
              </div>
              <button class="load-example-btn">Load Notes Data</button>
            </div>
            <div class="example-card" data-example="mixed">
              <h4>🔄 Mixed Data</h4>
              <p>Load sample data with all three types</p>
              <div class="example-code">
                <code>Sample data for testing</code>
              </div>
              <button class="load-example-btn">Load Mixed Sample</button>
            </div>
          </div>
        </div>
      </div>
    `;
    return container;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const jsonInput = document.getElementById("signalJsonInput");
    const convertBtn = document.getElementById("signalConvertBtn");
    const clearBtn = document.getElementById("signalClearBtn");
    const validateBtn = document.getElementById("signalValidateBtn");
    const loadExampleBtn = document.getElementById("loadExampleBtn");
    const copyTableBtn = document.getElementById("signalCopyTableBtn");
    const exportBtn = document.getElementById("signalExportBtn");
    const exportMenu = document.getElementById("signalExportMenu");
    const downloadCsvBtn = document.getElementById("signalDownloadCsvBtn");
    const downloadJsonBtn = document.getElementById("signalDownloadJsonBtn");
    const downloadTxtBtn = document.getElementById("signalDownloadTxtBtn");
    const applyFilterBtn = document.getElementById("signalApplyFilter");
    const clearFilterBtn = document.getElementById("signalClearFilter");
    const applySortBtn = document.getElementById("signalApplySort");
    const pageSizeSelect = document.getElementById("signalPageSize");
    const firstPageBtn = document.getElementById("signalFirstPage");
    const prevPageBtn = document.getElementById("signalPrevPage");
    const nextPageBtn = document.getElementById("signalNextPage");
    const lastPageBtn = document.getElementById("signalLastPage");

    if (convertBtn) {
      this.addEventListener(convertBtn, "click", () => this.convertJson());
    }
    if (clearBtn) {
      this.addEventListener(clearBtn, "click", () => this.clearAll());
    }
    if (validateBtn) {
      this.addEventListener(validateBtn, "click", () => this.validateJson());
    }
    if (loadExampleBtn) {
      this.addEventListener(loadExampleBtn, "click", () => this.loadExample());
    }
    if (copyTableBtn) {
      this.addEventListener(copyTableBtn, "click", () => this.copyTable());
    }
    if (exportBtn) {
      this.addEventListener(exportBtn, "click", () => this.toggleExportMenu());
    }
    if (downloadCsvBtn) {
      this.addEventListener(downloadCsvBtn, "click", () => this.downloadCsv());
    }
    if (downloadJsonBtn) {
      this.addEventListener(downloadJsonBtn, "click", () =>
        this.downloadJson()
      );
    }
    if (downloadTxtBtn) {
      this.addEventListener(downloadTxtBtn, "click", () => this.downloadTxt());
    }
    if (applyFilterBtn) {
      this.addEventListener(applyFilterBtn, "click", () => this.applyFilter());
    }
    if (clearFilterBtn) {
      this.addEventListener(clearFilterBtn, "click", () => this.clearFilter());
    }
    if (applySortBtn) {
      this.addEventListener(applySortBtn, "click", () => this.applySort());
    }
    if (pageSizeSelect) {
      this.addEventListener(pageSizeSelect, "change", () =>
        this.changePageSize()
      );
    }
    if (firstPageBtn) {
      this.addEventListener(firstPageBtn, "click", () => this.goToFirstPage());
    }
    if (prevPageBtn) {
      this.addEventListener(prevPageBtn, "click", () => this.goToPrevPage());
    }
    if (nextPageBtn) {
      this.addEventListener(nextPageBtn, "click", () => this.goToNextPage());
    }
    if (lastPageBtn) {
      this.addEventListener(lastPageBtn, "click", () => this.goToLastPage());
    }

    // Auto-validate on input change
    if (jsonInput) {
      this.addEventListener(jsonInput, "input", () => {
        this.validateJson();
      });

      // Handle Tab key for indentation
      this.addEventListener(jsonInput, "keydown", (e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          const start = jsonInput.selectionStart;
          const end = jsonInput.selectionEnd;
          jsonInput.value =
            jsonInput.value.substring(0, start) +
            "  " +
            jsonInput.value.substring(end);
          jsonInput.selectionStart = jsonInput.selectionEnd = start + 2;
        }
      });
    }

    // Example cards
    const exampleCards = document.querySelectorAll(".example-card");
    exampleCards.forEach((card) => {
      // Handle card click
      this.addEventListener(card, "click", () => {
        const example = card.dataset.example;
        this.loadExample(example);
      });

      // Handle button clicks specifically
      const loadBtn = card.querySelector(".load-example-btn");
      if (loadBtn) {
        this.addEventListener(loadBtn, "click", (e) => {
          e.stopPropagation(); // Prevent card click
          const example = card.dataset.example;
          this.loadExample(example);
        });
      }
    });

    // Close export menu when clicking outside
    this.addEventListener(document, "click", (e) => {
      const exportDropdown = e.target.closest(".export-dropdown");
      if (!exportDropdown) {
        this.closeExportMenu();
      }
    });
  }

  /**
   * Validate JSON input
   */
  validateJson() {
    const jsonInput = document.getElementById("signalJsonInput");
    const jsonStatus = document.getElementById("signalJsonStatus");
    const convertBtn = document.getElementById("signalConvertBtn");

    if (!jsonInput || !jsonStatus || !convertBtn) return;

    const input = jsonInput.value.trim();

    if (!input) {
      this.updateStatus("ready", "Ready to convert");
      convertBtn.disabled = true;
      return;
    }

    try {
      this.jsonData = JSON.parse(input);
      this.isValidJson = true;
      this.updateStatus("success", "Valid JSON - Ready to convert");
      convertBtn.disabled = false;
    } catch (error) {
      this.isValidJson = false;
      this.updateStatus("error", `Invalid JSON: ${error.message}`);
      convertBtn.disabled = true;
    }
  }

  /**
   * Update status display
   */
  updateStatus(type, message) {
    const jsonStatus = document.getElementById("signalJsonStatus");
    if (!jsonStatus) return;

    const icon = jsonStatus.querySelector(".status-icon");
    const text = jsonStatus.querySelector(".status-text");

    if (icon && text) {
      const icons = {
        ready: "⏳",
        success: "✅",
        error: "❌",
        processing: "🔄",
      };

      icon.textContent = icons[type] || "⏳";
      text.textContent = message;
      jsonStatus.className = `json-status ${type}`;
    }
  }

  /**
   * Convert JSON to table
   */
  convertJson() {
    if (!this.isValidJson || !this.jsonData) {
      this.showNotification("Please enter valid JSON data", "warning");
      return;
    }

    try {
      this.updateStatus("processing", "Converting signal survey data...");

      const options = this.getConversionOptions();
      const result = this.processSignalSurveyData(this.jsonData, options);

      this.tableData = result.data;
      this.headers = result.headers;

      this.renderTable();
      this.showPreview();
      this.updateStatus("success", "Conversion completed successfully");
    } catch (error) {
      console.error("Conversion error:", error);
      this.showNotification(`Conversion failed: ${error.message}`, "error");
      this.updateStatus("error", "Conversion failed");
    }
  }

  /**
   * Get conversion options
   */
  getConversionOptions() {
    return {
      flattenStatistics:
        document.getElementById("flattenStatistics")?.checked ?? true,
      formatTimestamps:
        document.getElementById("formatTimestamps")?.checked ?? true,
      includeMetadata:
        document.getElementById("includeMetadata")?.checked ?? true,
      createSummaryRow:
        document.getElementById("createSummaryRow")?.checked ?? true,
    };
  }

  /**
   * Process signal survey data into table format
   */
  processSignalSurveyData(data, options) {
    try {
      let rows = [];
      let headers = new Set();

      // Validate input data
      if (!data || (typeof data !== "object" && !Array.isArray(data))) {
        throw new Error("Invalid data: Expected object or array");
      }

      // Handle both single object and array of objects
      const dataArray = Array.isArray(data) ? data : [data];

      // Track data type statistics
      const dataTypeStats = {
        users: 0,
        reports: 0,
        "report-notes": 0,
        unknown: 0,
      };

      let processedCount = 0;
      let errorCount = 0;

      dataArray.forEach((item, index) => {
        try {
          if (!item || typeof item !== "object") {
            console.warn(`Skipping invalid item at index ${index}:`, item);
            errorCount++;
            return;
          }

          const dataType = this.detectDataType(item);
          dataTypeStats[dataType] = (dataTypeStats[dataType] || 0) + 1;

          const processedRows = this.processSignalSurveyItem(
            item,
            options,
            index,
            dataType
          );

          // Handle multiple rows per item (for notes with multiple questions)
          if (Array.isArray(processedRows)) {
            processedRows.forEach((row) => {
              if (row && typeof row === "object") {
                rows.push(row);
                Object.keys(row).forEach((key) => headers.add(key));
                processedCount++;
              }
            });
          } else if (processedRows && typeof processedRows === "object") {
            rows.push(processedRows);
            Object.keys(processedRows).forEach((key) => headers.add(key));
            processedCount++;
          }
        } catch (itemError) {
          console.error(`Error processing item at index ${index}:`, itemError);
          errorCount++;
        }
      });

      // Validate that we have some data
      if (rows.length === 0) {
        throw new Error(
          "No valid data found to process. Please check your JSON format."
        );
      }

      // Add summary row if requested and we have data
      if (options.createSummaryRow && rows.length > 0) {
        try {
          const summaryRow = this.createSummaryRow(
            rows,
            options,
            dataTypeStats
          );
          rows.push(summaryRow);
          Object.keys(summaryRow).forEach((key) => headers.add(key));
        } catch (summaryError) {
          console.warn("Error creating summary row:", summaryError);
        }
      }

      // Store data type statistics for display
      this.dataTypeStats = dataTypeStats;

      // Log processing results
      console.log(
        `Processed ${processedCount} records successfully${
          errorCount > 0 ? `, ${errorCount} errors` : ""
        }`
      );
      console.log("Data type statistics:", dataTypeStats);
      console.log("Sample processed row:", rows[0]);

      return {
        data: rows,
        headers: Array.from(headers).sort(),
        stats: {
          processed: processedCount,
          errors: errorCount,
          dataTypes: dataTypeStats,
        },
      };
    } catch (error) {
      console.error("Error in processSignalSurveyData:", error);
      throw new Error(`Data processing failed: ${error.message}`);
    }
  }

  /**
   * Detect the data type based on the path or data structure
   */
  detectDataType(item) {
    // Check for Firestore format first
    if (item.path) {
      if (item.path.startsWith("report-notes/")) return "report-notes";
      if (item.path.startsWith("reports/")) return "reports";
      if (item.path.startsWith("users/")) return "users";
    }

    // Check for processed format data
    // Users data detection
    if (item.id && item.email && item.role && item.statistics) {
      return "users";
    }

    // Reports data detection
    if (item.id && item.intersectionName && item.answers && item.createdBy) {
      return "reports";
    }

    // Report-notes data detection
    if (item.id && item.reportId && item.userId && item.notes) {
      return "report-notes";
    }

    return "unknown";
  }

  /**
   * Process a single signal survey item
   */
  processSignalSurveyItem(item, options, index, dataType) {
    switch (dataType) {
      case "report-notes":
        return this.processReportNotes(item, options, index);
      case "reports":
        return this.processReports(item, options, index);
      case "users":
        return this.processUsers(item, options, index);
      default:
        return this.processGeneric(item, options, index);
    }
  }

  /**
   * Process report notes data
   */
  processReportNotes(item, options, index) {
    try {
      const rows = [];

      // Determine if this is Firestore format or processed format
      const isFirestoreFormat = item.path && item.data;
      const noteData = isFirestoreFormat ? item.data : item;
      const notePath = isFirestoreFormat
        ? item.path
        : `report-notes/${noteData.id}`;
      const readTime = isFirestoreFormat ? item.readTime : noteData.readTime;

      if (!noteData || !noteData.notes || !Array.isArray(noteData.notes)) {
        console.warn(`Report notes data missing or invalid for item ${index}`);
        return this.processGeneric(item, options, index);
      }

      noteData.notes.forEach((note, noteIndex) => {
        try {
          if (!note || typeof note !== "object") {
            console.warn(`Invalid note at index ${noteIndex} in item ${index}`);
            return;
          }

          const row = {};

          // Add index if multiple items
          if (Array.isArray(this.jsonData) && this.jsonData.length > 1) {
            row["Record_Index"] = index + 1;
          }
          row["Note_Index"] = noteIndex + 1;

          // Process metadata
          if (options.includeMetadata) {
            row["Report_Notes_Path"] = notePath;
            if (readTime) {
              row["Read_Time"] = options.formatTimestamps
                ? this.formatTimestamp(readTime)
                : readTime;
            }
          }

          // Process report notes specific data
          if (noteData) {
            if (noteData.reportId) row["Report_ID"] = noteData.reportId;
            if (noteData.userId) row["User_ID"] = noteData.userId;

            if (noteData.createdAt) {
              row["Report_Created_At"] = options.formatTimestamps
                ? this.formatTimestamp(noteData.createdAt)
                : noteData.createdAt;
            }
            if (noteData.updatedAt) {
              row["Report_Updated_At"] = options.formatTimestamps
                ? this.formatTimestamp(noteData.updatedAt)
                : noteData.updatedAt;
            }
          }

          // Process note data
          if (note.questionId) row["Question_ID"] = note.questionId;
          if (note.text) row["Note_Text"] = note.text;

          if (note.createdAt) {
            row["Note_Created_At"] = options.formatTimestamps
              ? this.formatTimestamp(note.createdAt)
              : note.createdAt;
          }
          if (note.updatedAt) {
            row["Note_Updated_At"] = options.formatTimestamps
              ? this.formatTimestamp(note.updatedAt)
              : note.updatedAt;
          }

          // Process images with error handling
          if (note.images && Array.isArray(note.images)) {
            row["Image_Count"] = note.images.length;
            row["Total_Image_Size"] = note.images.reduce((total, img) => {
              try {
                return total + (typeof img.size === "number" ? img.size : 0);
              } catch {
                return total;
              }
            }, 0);
            row["Image_URLs"] = note.images
              .map((img) => {
                try {
                  return img.url || img.preview || "";
                } catch {
                  return "";
                }
              })
              .filter((url) => url)
              .join("; ");
          } else {
            row["Image_Count"] = 0;
            row["Total_Image_Size"] = 0;
            row["Image_URLs"] = "";
          }

          rows.push(row);
        } catch (noteError) {
          console.error(
            `Error processing note at index ${noteIndex}:`,
            noteError
          );
        }
      });

      return rows.length > 0 ? rows : this.processGeneric(item, options, index);
    } catch (error) {
      console.error(`Error processing report notes for item ${index}:`, error);
      return this.processGeneric(item, options, index);
    }
  }

  /**
   * Process reports data
   */
  processReports(item, options, index) {
    const row = {};

    // Add index if multiple items
    if (Array.isArray(this.jsonData) && this.jsonData.length > 1) {
      row["Record_Index"] = index + 1;
    }

    // Determine if this is Firestore format or processed format
    const isFirestoreFormat = item.path && item.data;
    const reportData = isFirestoreFormat ? item.data : item;
    const reportPath = isFirestoreFormat
      ? item.path
      : `reports/${reportData.id}`;
    const readTime = isFirestoreFormat ? item.readTime : reportData.readTime;

    // Process metadata
    if (options.includeMetadata) {
      row["Report_Path"] = reportPath;
      if (readTime) {
        row["Read_Time"] = options.formatTimestamps
          ? this.formatTimestamp(readTime)
          : readTime;
      }
    }

    // Process report data
    if (reportData) {
      // Basic report information
      if (reportData.id) row["Report_ID"] = reportData.id;
      if (reportData.createdBy) row["Created_By"] = reportData.createdBy;
      if (reportData.displayName)
        row["Creator_Display_Name"] = reportData.displayName;
      if (reportData.intersectionName)
        row["Intersection_Name"] = reportData.intersectionName;
      if (reportData.intersectionId)
        row["Intersection_ID"] = reportData.intersectionId;
      if (reportData.surveyDate) row["Survey_Date"] = reportData.surveyDate;
      if (reportData.inspectorCode)
        row["Inspector_Code"] = reportData.inspectorCode;
      if (reportData.status) row["Status"] = reportData.status;
      if (reportData.title) row["Title"] = reportData.title;
      if (reportData.description) row["Description"] = reportData.description;

      // Timestamps
      if (reportData.createdAt) {
        row["Created_At"] = options.formatTimestamps
          ? this.formatTimestamp(reportData.createdAt)
          : reportData.createdAt;
      }
      if (reportData.updatedAt) {
        row["Updated_At"] = options.formatTimestamps
          ? this.formatTimestamp(reportData.updatedAt)
          : reportData.updatedAt;
      }

      // Process answers
      if (reportData.answers && Array.isArray(reportData.answers)) {
        row["Answer_Count"] = reportData.answers.length;

        // Flatten answers if requested
        if (options.flattenStatistics) {
          reportData.answers.forEach((answer) => {
            const key = `Answer_${answer.questionId}`;
            row[key] = answer.value || "";
          });
        } else {
          row["Answers"] = JSON.stringify(reportData.answers);
        }
      }

      // Process other arrays
      if (reportData.files && Array.isArray(reportData.files)) {
        row["File_Count"] = reportData.files.length;
      }
      if (reportData.tags && Array.isArray(reportData.tags)) {
        row["Tags"] = reportData.tags.join(", ");
      }
      if (reportData.regionIds && Array.isArray(reportData.regionIds)) {
        row["Region_IDs"] = reportData.regionIds.join(", ");
      }
    }

    return row;
  }

  /**
   * Process users data
   */
  processUsers(item, options, index) {
    const row = {};

    // Add index if multiple items
    if (Array.isArray(this.jsonData) && this.jsonData.length > 1) {
      row["Record_Index"] = index + 1;
    }

    // Determine if this is Firestore format or processed format
    const isFirestoreFormat = item.path && item.data;
    const userData = isFirestoreFormat ? item.data : item;
    const userPath = isFirestoreFormat
      ? item.path
      : `users/${userData.id || userData.uid}`;
    const readTime = isFirestoreFormat ? item.readTime : userData.readTime;

    // Process metadata
    if (options.includeMetadata) {
      row["User_Path"] = userPath;
      if (readTime) {
        row["Read_Time"] = options.formatTimestamps
          ? this.formatTimestamp(readTime)
          : readTime;
      }
    }

    // Process user data
    if (userData) {
      // Basic user information
      if (userData.uid) row["User_ID"] = userData.uid;
      if (userData.id) row["User_ID"] = userData.id;
      if (userData.email) row["Email"] = userData.email;
      if (userData.displayName) row["Display_Name"] = userData.displayName;
      if (userData.role) row["Role"] = userData.role;
      if (userData.missionsCompleted !== undefined)
        row["Missions_Completed"] = userData.missionsCompleted;
      if (userData.missionsInProgress !== undefined)
        row["Missions_In_Progress"] = userData.missionsInProgress;

      // Timestamps
      if (userData.createdAt) {
        row["Created_At"] = options.formatTimestamps
          ? this.formatTimestamp(userData.createdAt)
          : userData.createdAt;
      }
      if (userData.updatedAt) {
        row["Updated_At"] = options.formatTimestamps
          ? this.formatTimestamp(userData.updatedAt)
          : userData.updatedAt;
      }

      // Statistics
      if (userData.statistics && options.flattenStatistics) {
        const stats = userData.statistics;
        if (stats.flashingIntersections !== undefined)
          row["Flashing_Intersections"] = stats.flashingIntersections;
        if (stats.singleFlashIntersections !== undefined)
          row["Single_Flash_Intersections"] = stats.singleFlashIntersections;
        if (stats.totalSignalPoles !== undefined)
          row["Total_Signal_Poles"] = stats.totalSignalPoles;
        if (stats.totalPedestrianSignals !== undefined)
          row["Total_Pedestrian_Signals"] = stats.totalPedestrianSignals;
        if (stats.threeColorIntersections !== undefined)
          row["Three_Color_Intersections"] = stats.threeColorIntersections;
        if (stats.totalControllers !== undefined)
          row["Total_Controllers"] = stats.totalControllers;
      } else if (userData.statistics) {
        row["Statistics"] = JSON.stringify(userData.statistics);
      }
    }

    return row;
  }

  /**
   * Process generic data (fallback)
   */
  processGeneric(item, options, index) {
    const row = {};

    // Add index if multiple items
    if (Array.isArray(this.jsonData) && this.jsonData.length > 1) {
      row["Record_Index"] = index + 1;
    }

    // Process metadata
    if (options.includeMetadata) {
      if (item.path) {
        row["Path"] = item.path;
      }
      if (item.readTime) {
        row["Read_Time"] = options.formatTimestamps
          ? this.formatTimestamp(item.readTime)
          : item.readTime;
      }
    }

    // Process main data generically
    if (item.data) {
      this.flattenObject(item.data, "", row, {
        flattenNested: options.flattenStatistics,
        includeEmptyRows: true,
        convertDates: options.formatTimestamps,
      });
    }

    return row;
  }

  /**
   * Flatten nested object (helper method)
   */
  flattenObject(obj, prefix, result, options) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];

        if (value === null || value === undefined) {
          if (options.includeEmptyRows) {
            result[newKey] = "";
          }
        } else if (Array.isArray(value)) {
          if (options.flattenNested) {
            result[newKey] = value
              .map((item) =>
                typeof item === "object" ? JSON.stringify(item) : String(item)
              )
              .join(", ");
          } else {
            result[newKey] = JSON.stringify(value);
          }
        } else if (typeof value === "object") {
          if (options.flattenNested) {
            this.flattenObject(value, newKey, result, options);
          } else {
            result[newKey] = JSON.stringify(value);
          }
        } else {
          let processedValue = value;

          if (options.convertDates && this.isDateString(value)) {
            processedValue = this.formatDate(value);
          }

          result[newKey] = processedValue;
        }
      }
    }
  }

  /**
   * Check if string is a date
   */
  isDateString(value) {
    if (typeof value !== "string") return false;
    const date = new Date(value);
    return !isNaN(date.getTime()) && value.match(/^\d{4}-\d{2}-\d{2}/);
  }

  /**
   * Format date string
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  /**
   * Create summary row
   */
  createSummaryRow(rows, options, dataTypeStats = {}) {
    const summaryRow = {};

    // Add summary identifier
    summaryRow["Record_Index"] = "SUMMARY";
    summaryRow["User_Path"] = "TOTALS";

    // Calculate totals for numeric statistics
    const numericFields = [
      "Missions_Completed",
      "Missions_In_Progress",
      "Flashing_Intersections",
      "Single_Flash_Intersections",
      "Total_Signal_Poles",
      "Total_Pedestrian_Signals",
      "Three_Color_Intersections",
      "Total_Controllers",
      "Image_Count",
      "Total_Image_Size",
      "Answer_Count",
      "File_Count",
    ];

    numericFields.forEach((field) => {
      const total = rows.reduce((sum, row) => {
        const value = row[field];
        return sum + (typeof value === "number" ? value : 0);
      }, 0);

      if (total > 0 || rows.some((row) => row[field] !== undefined)) {
        summaryRow[field] = total;
      }
    });

    // Count different data types using provided statistics
    if (dataTypeStats.users > 0)
      summaryRow["User_Records"] = dataTypeStats.users;
    if (dataTypeStats.reports > 0)
      summaryRow["Report_Records"] = dataTypeStats.reports;
    if (dataTypeStats["report-notes"] > 0)
      summaryRow["Note_Records"] = dataTypeStats["report-notes"];
    if (dataTypeStats.unknown > 0)
      summaryRow["Unknown_Records"] = dataTypeStats.unknown;

    // Add processing metadata
    summaryRow["Total_Records"] = rows.length;
    summaryRow["Processing_Time"] = new Date().toLocaleTimeString();

    return summaryRow;
  }

  /**
   * Format Firestore timestamp or ISO date string
   */
  formatTimestamp(timestamp) {
    try {
      let date;

      if (timestamp && typeof timestamp === "object" && timestamp._seconds) {
        // Firestore timestamp
        date = new Date(timestamp._seconds * 1000);
      } else if (typeof timestamp === "string") {
        // ISO string
        date = new Date(timestamp);
      } else {
        return timestamp;
      }

      if (isNaN(date.getTime())) {
        return timestamp;
      }

      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  }

  /**
   * Render table with pagination
   */
  renderTable() {
    const tableHead = document.getElementById("signalTableHead");
    const tableBody = document.getElementById("signalTableBody");
    const rowCount = document.getElementById("signalRowCount");
    const columnCount = document.getElementById("signalColumnCount");
    const dataType = document.getElementById("signalDataType");

    if (!tableHead || !tableBody || !rowCount || !columnCount || !dataType)
      return;

    // Clear existing content
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    // Create header row
    const headerRow = document.createElement("tr");
    this.headers.forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      th.title = header;
      headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

    // Get data to display (considering filters and sorting)
    const dataToDisplay =
      this.sortedData || this.filteredData || this.tableData;

    // Calculate pagination
    this.totalPages = Math.ceil(dataToDisplay.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, dataToDisplay.length);
    const pageData = dataToDisplay.slice(startIndex, endIndex);

    // Create data rows for current page
    pageData.forEach((row, index) => {
      const tr = document.createElement("tr");

      // Add summary row styling
      if (row.Record_Index === "SUMMARY" || row.User_Path === "SUMMARY") {
        tr.classList.add("summary-row");
      }

      this.headers.forEach((header) => {
        const td = document.createElement("td");
        const value = row[header] ?? "";
        td.textContent = String(value);
        td.title = String(value);
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });

    // Update stats
    const dataRows = dataToDisplay.filter(
      (row) => row.Record_Index !== "SUMMARY" && row.User_Path !== "SUMMARY"
    );
    rowCount.textContent = dataRows.length;
    columnCount.textContent = this.headers.length;

    // Enhanced data type display
    let dataTypeText = Array.isArray(this.jsonData) ? "Array" : "Object";
    if (this.dataTypeStats) {
      const typeCounts = Object.entries(this.dataTypeStats)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => `${type}(${count})`)
        .join(", ");
      if (typeCounts) {
        dataTypeText += ` - ${typeCounts}`;
      }
    }
    dataType.textContent = dataTypeText;

    // Update pagination controls
    this.updatePaginationControls(dataRows.length, startIndex, endIndex);
  }

  /**
   * Show preview section
   */
  showPreview() {
    const previewSection = document.getElementById("signalPreviewSection");
    const tableControls = document.getElementById("signalTableControls");
    const paginationControls = document.getElementById(
      "signalPaginationControls"
    );

    if (previewSection) {
      previewSection.style.display = "block";
      previewSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (tableControls) {
      tableControls.style.display = "block";
      this.populateColumnSelectors();
    }

    if (paginationControls) {
      paginationControls.style.display = "block";
    }
  }

  /**
   * Update pagination controls
   */
  updatePaginationControls(totalRecords, startIndex, endIndex) {
    const currentPageEl = document.getElementById("signalCurrentPage");
    const totalPagesEl = document.getElementById("signalTotalPages");
    const startRecordEl = document.getElementById("signalStartRecord");
    const endRecordEl = document.getElementById("signalEndRecord");
    const totalRecordsEl = document.getElementById("signalTotalRecords");
    const firstPageBtn = document.getElementById("signalFirstPage");
    const prevPageBtn = document.getElementById("signalPrevPage");
    const nextPageBtn = document.getElementById("signalNextPage");
    const lastPageBtn = document.getElementById("signalLastPage");

    if (currentPageEl) currentPageEl.textContent = this.currentPage;
    if (totalPagesEl) totalPagesEl.textContent = this.totalPages;
    if (startRecordEl) startRecordEl.textContent = startIndex + 1;
    if (endRecordEl) endRecordEl.textContent = endIndex;
    if (totalRecordsEl) totalRecordsEl.textContent = totalRecords;

    // Update button states
    if (firstPageBtn) firstPageBtn.disabled = this.currentPage === 1;
    if (prevPageBtn) prevPageBtn.disabled = this.currentPage === 1;
    if (nextPageBtn)
      nextPageBtn.disabled = this.currentPage === this.totalPages;
    if (lastPageBtn)
      lastPageBtn.disabled = this.currentPage === this.totalPages;
  }

  /**
   * Change page size
   */
  changePageSize() {
    const pageSizeSelect = document.getElementById("signalPageSize");
    if (pageSizeSelect) {
      this.pageSize = parseInt(pageSizeSelect.value);
      this.currentPage = 1; // Reset to first page
      this.renderTable();
    }
  }

  /**
   * Go to first page
   */
  goToFirstPage() {
    if (this.currentPage > 1) {
      this.currentPage = 1;
      this.renderTable();
    }
  }

  /**
   * Go to previous page
   */
  goToPrevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderTable();
    }
  }

  /**
   * Go to next page
   */
  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.renderTable();
    }
  }

  /**
   * Go to last page
   */
  goToLastPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage = this.totalPages;
      this.renderTable();
    }
  }

  /**
   * Populate column selectors for filtering and sorting
   */
  populateColumnSelectors() {
    const filterColumn = document.getElementById("signalFilterColumn");
    const sortColumn = document.getElementById("signalSortColumn");

    if (filterColumn && sortColumn) {
      // Clear existing options
      filterColumn.innerHTML = '<option value="">All columns</option>';
      sortColumn.innerHTML = '<option value="">No sorting</option>';

      // Add column options
      this.headers.forEach((header) => {
        const filterOption = document.createElement("option");
        filterOption.value = header;
        filterOption.textContent = header;
        filterColumn.appendChild(filterOption);

        const sortOption = document.createElement("option");
        sortOption.value = header;
        sortOption.textContent = header;
        sortColumn.appendChild(sortOption);
      });
    }
  }

  /**
   * Apply filter to table data
   */
  applyFilter() {
    const filterColumn = document.getElementById("signalFilterColumn");
    const filterValue = document.getElementById("signalFilterValue");

    if (!filterColumn || !filterValue) return;

    const column = filterColumn.value;
    const value = filterValue.value.trim().toLowerCase();

    if (!column || !value) {
      this.showNotification(
        "Please select a column and enter a filter value",
        "warning"
      );
      return;
    }

    this.filteredData = this.tableData.filter((row) => {
      const cellValue = String(row[column] || "").toLowerCase();
      return cellValue.includes(value);
    });

    this.renderFilteredTable();
    this.showNotification(
      `Filtered to ${this.filteredData.length} records`,
      "success"
    );
  }

  /**
   * Clear filter and show all data
   */
  clearFilter() {
    const filterColumn = document.getElementById("signalFilterColumn");
    const filterValue = document.getElementById("signalFilterValue");

    if (filterColumn) filterColumn.value = "";
    if (filterValue) filterValue.value = "";

    this.filteredData = null;
    this.renderTable();
    this.showNotification("Filter cleared", "success");
  }

  /**
   * Apply sorting to table data
   */
  applySort() {
    const sortColumn = document.getElementById("signalSortColumn");
    const sortOrder = document.getElementById("signalSortOrder");

    if (!sortColumn || !sortOrder) return;

    const column = sortColumn.value;
    const order = sortOrder.value;

    if (!column) {
      this.showNotification("Please select a column to sort by", "warning");
      return;
    }

    const dataToSort = this.filteredData || this.tableData;

    this.sortedData = [...dataToSort].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];

      // Handle different data types
      let comparison = 0;

      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        const aStr = String(aVal || "").toLowerCase();
        const bStr = String(bVal || "").toLowerCase();
        comparison = aStr.localeCompare(bStr);
      }

      return order === "desc" ? -comparison : comparison;
    });

    this.renderSortedTable();
    this.showNotification(`Sorted by ${column} (${order})`, "success");
  }

  /**
   * Render filtered table
   */
  renderFilteredTable() {
    const tableHead = document.getElementById("signalTableHead");
    const tableBody = document.getElementById("signalTableBody");
    const rowCount = document.getElementById("signalRowCount");

    if (!tableHead || !tableBody || !rowCount) return;

    // Clear existing content
    tableBody.innerHTML = "";

    // Create data rows
    this.filteredData.forEach((row, index) => {
      const tr = document.createElement("tr");

      // Add summary row styling
      if (row.Record_Index === "SUMMARY" || row.User_Path === "SUMMARY") {
        tr.classList.add("summary-row");
      }

      this.headers.forEach((header) => {
        const td = document.createElement("td");
        const value = row[header] ?? "";
        td.textContent = String(value);
        td.title = String(value);
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });

    // Update row count
    const dataRows = this.filteredData.filter(
      (row) => row.Record_Index !== "SUMMARY" && row.User_Path !== "SUMMARY"
    );
    rowCount.textContent = dataRows.length;
  }

  /**
   * Render sorted table
   */
  renderSortedTable() {
    const tableHead = document.getElementById("signalTableHead");
    const tableBody = document.getElementById("signalTableBody");
    const rowCount = document.getElementById("signalRowCount");

    if (!tableHead || !tableBody || !rowCount) return;

    // Clear existing content
    tableBody.innerHTML = "";

    // Create data rows
    this.sortedData.forEach((row, index) => {
      const tr = document.createElement("tr");

      // Add summary row styling
      if (row.Record_Index === "SUMMARY" || row.User_Path === "SUMMARY") {
        tr.classList.add("summary-row");
      }

      this.headers.forEach((header) => {
        const td = document.createElement("td");
        const value = row[header] ?? "";
        td.textContent = String(value);
        td.title = String(value);
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });

    // Update row count
    const dataRows = this.sortedData.filter(
      (row) => row.Record_Index !== "SUMMARY" && row.User_Path !== "SUMMARY"
    );
    rowCount.textContent = dataRows.length;
  }

  /**
   * Copy table to clipboard
   */
  async copyTable() {
    const dataToCopy = this.sortedData || this.filteredData || this.tableData;

    if (dataToCopy.length === 0) {
      this.showNotification("No table data to copy", "warning");
      return;
    }

    try {
      let csvContent = this.headers.join("\t") + "\n";

      dataToCopy.forEach((row) => {
        const values = this.headers.map((header) => {
          const value = row[header] ?? "";
          return String(value).replace(/\t/g, " ").replace(/\n/g, " ");
        });
        csvContent += values.join("\t") + "\n";
      });

      await navigator.clipboard.writeText(csvContent);
      this.showNotification(
        `Signal survey table copied to clipboard! (${dataToCopy.length} records)`,
        "success"
      );
    } catch (error) {
      console.error("Failed to copy table:", error);
      this.showNotification("Failed to copy table", "error");
    }
  }

  /**
   * Toggle export menu visibility
   */
  toggleExportMenu() {
    const exportMenu = document.getElementById("signalExportMenu");
    const exportBtn = document.getElementById("signalExportBtn");
    const exportDropdown = exportBtn?.closest(".export-dropdown");

    if (exportMenu && exportDropdown) {
      const isOpen = exportMenu.classList.contains("show");

      if (isOpen) {
        exportMenu.classList.remove("show");
        exportDropdown.classList.remove("active");
      } else {
        // Close any other open menus first
        document.querySelectorAll(".export-menu.show").forEach((menu) => {
          menu.classList.remove("show");
          menu.closest(".export-dropdown")?.classList.remove("active");
        });

        exportMenu.classList.add("show");
        exportDropdown.classList.add("active");
      }
    }
  }

  /**
   * Close export menu when clicking outside
   */
  closeExportMenu() {
    const exportMenu = document.getElementById("signalExportMenu");
    const exportDropdown = exportMenu?.closest(".export-dropdown");

    if (exportMenu && exportDropdown) {
      exportMenu.classList.remove("show");
      exportDropdown.classList.remove("active");
    }
  }

  /**
   * Download CSV file
   */
  downloadCsv() {
    const dataToDownload =
      this.sortedData || this.filteredData || this.tableData;

    if (dataToDownload.length === 0) {
      this.showNotification("No table data to download", "warning");
      return;
    }

    try {
      let csvContent = this.headers.join(",") + "\n";

      dataToDownload.forEach((row) => {
        const values = this.headers.map((header) => {
          const value = row[header] ?? "";
          // Escape CSV values
          const stringValue = String(value);
          if (
            stringValue.includes(",") ||
            stringValue.includes('"') ||
            stringValue.includes("\n")
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        });
        csvContent += values.join(",") + "\n";
      });

      this.downloadFile(csvContent, "signal-survey-data", "csv", "text/csv");
      this.closeExportMenu();
      this.showNotification(
        `CSV file downloaded successfully! (${dataToDownload.length} records)`,
        "success"
      );
    } catch (error) {
      console.error("Failed to download CSV:", error);
      this.showNotification("Failed to download CSV", "error");
    }
  }

  /**
   * Download JSON file
   */
  downloadJson() {
    const dataToDownload =
      this.sortedData || this.filteredData || this.tableData;

    if (dataToDownload.length === 0) {
      this.showNotification("No table data to download", "warning");
      return;
    }

    try {
      const jsonData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          recordCount: dataToDownload.length,
          columnCount: this.headers.length,
          dataTypes: this.dataTypeStats || {},
          filters: this.filteredData ? "Applied" : "None",
          sorting: this.sortedData ? "Applied" : "None",
        },
        headers: this.headers,
        data: dataToDownload,
      };

      const jsonContent = JSON.stringify(jsonData, null, 2);
      this.downloadFile(
        jsonContent,
        "signal-survey-data",
        "json",
        "application/json"
      );
      this.closeExportMenu();
      this.showNotification(
        `JSON file downloaded successfully! (${dataToDownload.length} records)`,
        "success"
      );
    } catch (error) {
      console.error("Failed to download JSON:", error);
      this.showNotification("Failed to download JSON", "error");
    }
  }

  /**
   * Download TXT file
   */
  downloadTxt() {
    const dataToDownload =
      this.sortedData || this.filteredData || this.tableData;

    if (dataToDownload.length === 0) {
      this.showNotification("No table data to download", "warning");
      return;
    }

    try {
      let txtContent = `Signal Survey Data Export\n`;
      txtContent += `Generated: ${new Date().toLocaleString()}\n`;
      txtContent += `Records: ${dataToDownload.length}\n`;
      txtContent += `Columns: ${this.headers.length}\n`;
      txtContent += `\n${"=".repeat(80)}\n\n`;

      // Create a formatted table
      const colWidths = this.headers.map((header) => {
        const maxLength = Math.max(
          header.length,
          ...dataToDownload.map((row) => String(row[header] || "").length)
        );
        return Math.min(maxLength, 30); // Cap at 30 characters
      });

      // Header row
      const headerRow = this.headers
        .map((header, i) => header.padEnd(colWidths[i]))
        .join(" | ");
      txtContent += headerRow + "\n";
      txtContent += "-".repeat(headerRow.length) + "\n";

      // Data rows
      dataToDownload.forEach((row) => {
        const dataRow = this.headers
          .map((header, i) => {
            const value = String(row[header] || "").substring(0, colWidths[i]);
            return value.padEnd(colWidths[i]);
          })
          .join(" | ");
        txtContent += dataRow + "\n";
      });

      this.downloadFile(txtContent, "signal-survey-data", "txt", "text/plain");
      this.closeExportMenu();
      this.showNotification(
        `TXT file downloaded successfully! (${dataToDownload.length} records)`,
        "success"
      );
    } catch (error) {
      console.error("Failed to download TXT:", error);
      this.showNotification("Failed to download TXT", "error");
    }
  }

  /**
   * Generic file download helper
   */
  downloadFile(content, filename, extension, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${
      new Date().toISOString().split("T")[0]
    }.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Clear all data
   */
  clearAll() {
    const jsonInput = document.getElementById("signalJsonInput");
    const previewSection = document.getElementById("signalPreviewSection");
    const tableControls = document.getElementById("signalTableControls");
    const convertBtn = document.getElementById("signalConvertBtn");

    if (jsonInput) {
      jsonInput.value = "";
      jsonInput.focus();
    }

    if (previewSection) {
      previewSection.style.display = "none";
    }

    if (tableControls) {
      tableControls.style.display = "none";
    }

    if (convertBtn) {
      convertBtn.disabled = true;
    }

    // Reset all data
    this.jsonData = null;
    this.tableData = [];
    this.headers = [];
    this.isValidJson = false;
    this.filteredData = null;
    this.sortedData = null;
    this.dataTypeStats = null;

    // Reset pagination
    this.currentPage = 1;
    this.totalPages = 1;
    this.isProcessing = false;

    // Clear filter and sort controls
    const filterColumn = document.getElementById("signalFilterColumn");
    const filterValue = document.getElementById("signalFilterValue");
    const sortColumn = document.getElementById("signalSortColumn");
    const sortOrder = document.getElementById("signalSortOrder");

    if (filterColumn) filterColumn.value = "";
    if (filterValue) filterValue.value = "";
    if (sortColumn) sortColumn.value = "";
    if (sortOrder) sortOrder.value = "asc";

    this.updateStatus("ready", "Ready to convert");
  }

  /**
   * Load example signal survey JSON
   */
  async loadExample(exampleType = "mixed") {
    const jsonInput = document.getElementById("signalJsonInput");
    if (!jsonInput) return;

    try {
      let data;

      switch (exampleType) {
        case "users":
          data = await this.loadDataFile("users.json");
          break;
        case "reports":
          data = await this.loadDataFile("reports.json");
          break;
        case "report-notes":
          data = await this.loadDataFile("report-notes.json");
          break;
        case "mixed":
        default:
          // Create a mixed sample with all three data types
          data = [
            {
              path: "users/vo22sOnzwVSnDSM74feHWufvRjs2",
              data: {
                missionsCompleted: 5,
                missionsInProgress: 2,
                createdAt: "2025-09-30T06:34:04.293Z",
                email: "zii@iactor.com.tw",
                uid: "vo22sOnzwVSnDSM74feHWufvRjs2",
                statistics: {
                  flashingIntersections: 3,
                  singleFlashIntersections: 2,
                  totalSignalPoles: 15,
                  totalPedestrianSignals: 8,
                  threeColorIntersections: 5,
                  totalControllers: 10,
                },
                id: "vo22sOnzwVSnDSM74feHWufvRjs2",
                displayName: "User",
                role: "admin",
                updatedAt: {
                  _seconds: 1760163271,
                  _nanoseconds: 67000000,
                },
              },
              readTime: "2025-10-15T11:24:42.533Z",
            },
            {
              path: "reports/report_1759726431557_h63flei",
              data: {
                createdBy: "VlJefm51jzgdWqMbyfoKZ6BeHBo1",
                displayName: "user1@iactor.com.tw",
                intersectionName: "台27線、勝利路、中正路",
                intersectionId: "10052171",
                surveyDate: "2025-10-06",
                inspectorCode: "VlJefm51",
                status: "已提交",
                title: "屏東號誌路口調查",
                description: "調查標的包含號誌桿、燈箱、行人燈等項目",
                answers: [
                  { questionId: "A3-1", value: "6" },
                  { questionId: "A3-4", value: "0,1,2,3" },
                  { questionId: "A3-3", value: "0,1,2,5" },
                ],
                tags: ["調查"],
                regionIds: ["pingtung"],
                createdAt: {
                  _seconds: 1759726947,
                  _nanoseconds: 383000000,
                },
                updatedAt: {
                  _seconds: 1759726947,
                  _nanoseconds: 383000000,
                },
              },
              readTime: "2025-10-15T11:24:35.714Z",
            },
            {
              path: "report-notes/VlJefm51jzgdWqMbyfoKZ6BeHBo1_report_1759287209484_qpb0mng",
              data: {
                reportId: "report_1759287209484_qpb0mng",
                userId: "VlJefm51jzgdWqMbyfoKZ6BeHBo1",
                notes: [
                  {
                    questionId: "A3-1",
                    text: "Signal pole inspection completed",
                    images: [
                      {
                        id: "9bce9z8",
                        url: "https://example.com/image1.jpg",
                        size: 3225312,
                        uploadedAt: "2025-10-01T02:58:47.135Z",
                      },
                    ],
                    createdAt: "2025-10-01T02:58:47.136Z",
                    updatedAt: "2025-10-01T02:59:05.906Z",
                  },
                  {
                    questionId: "A3-2",
                    text: "Pedestrian signal check",
                    images: [],
                    createdAt: "2025-10-01T02:59:39.460Z",
                    updatedAt: "2025-10-01T02:59:50.284Z",
                  },
                ],
                createdAt: "2025-10-01T03:06:51.226Z",
                updatedAt: "2025-10-01T03:06:51.226Z",
              },
              readTime: "2025-10-15T11:24:23.437Z",
            },
          ];
          break;
      }

      jsonInput.value = JSON.stringify(data, null, 2);
      this.validateJson();
      this.showNotification(
        `Loaded ${exampleType} data successfully!`,
        "success"
      );
    } catch (error) {
      console.error("Failed to load example data:", error);
      this.showNotification(
        `Failed to load ${exampleType} data: ${error.message}`,
        "error"
      );
    }
  }

  /**
   * Load data from JSON file
   */
  async loadDataFile(filename) {
    try {
      const response = await fetch(`/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to load ${filename}: ${error.message}`);
    }
  }
}
