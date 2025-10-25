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
              <button id="signalDownloadCsvBtn" class="btn btn-download">
                <svg class="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download CSV
              </button>
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
    const downloadCsvBtn = document.getElementById("signalDownloadCsvBtn");

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
    if (downloadCsvBtn) {
      this.addEventListener(downloadCsvBtn, "click", () => this.downloadCsv());
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
    let rows = [];
    let headers = new Set();

    // Handle both single object and array of objects
    const dataArray = Array.isArray(data) ? data : [data];

    dataArray.forEach((item, index) => {
      const dataType = this.detectDataType(item);
      const processedRows = this.processSignalSurveyItem(
        item,
        options,
        index,
        dataType
      );

      // Handle multiple rows per item (for notes with multiple questions)
      if (Array.isArray(processedRows)) {
        processedRows.forEach((row) => {
          rows.push(row);
          Object.keys(row).forEach((key) => headers.add(key));
        });
      } else {
        rows.push(processedRows);
        Object.keys(processedRows).forEach((key) => headers.add(key));
      }
    });

    // Add summary row if requested and we have data
    if (options.createSummaryRow && rows.length > 0) {
      const summaryRow = this.createSummaryRow(rows, options);
      rows.push(summaryRow);
      Object.keys(summaryRow).forEach((key) => headers.add(key));
    }

    return {
      data: rows,
      headers: Array.from(headers),
    };
  }

  /**
   * Detect the data type based on the path
   */
  detectDataType(item) {
    if (!item.path) return "unknown";

    if (item.path.startsWith("report-notes/")) return "report-notes";
    if (item.path.startsWith("reports/")) return "reports";
    if (item.path.startsWith("users/")) return "users";

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
    const rows = [];

    if (!item.data || !item.data.notes || !Array.isArray(item.data.notes)) {
      return this.processGeneric(item, options, index);
    }

    item.data.notes.forEach((note, noteIndex) => {
      const row = {};

      // Add index if multiple items
      if (Array.isArray(this.jsonData) && this.jsonData.length > 1) {
        row["Record_Index"] = index + 1;
      }
      row["Note_Index"] = noteIndex + 1;

      // Process metadata
      if (options.includeMetadata) {
        if (item.path) {
          row["Report_Notes_Path"] = item.path;
        }
        if (item.readTime) {
          row["Read_Time"] = options.formatTimestamps
            ? this.formatTimestamp(item.readTime)
            : item.readTime;
        }
      }

      // Process report notes specific data
      if (item.data) {
        if (item.data.reportId) row["Report_ID"] = item.data.reportId;
        if (item.data.userId) row["User_ID"] = item.data.userId;

        if (item.data.createdAt) {
          row["Report_Created_At"] = options.formatTimestamps
            ? this.formatTimestamp(item.data.createdAt)
            : item.data.createdAt;
        }
        if (item.data.updatedAt) {
          row["Report_Updated_At"] = options.formatTimestamps
            ? this.formatTimestamp(item.data.updatedAt)
            : item.data.updatedAt;
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

      // Process images
      if (note.images && Array.isArray(note.images)) {
        row["Image_Count"] = note.images.length;
        row["Total_Image_Size"] = note.images.reduce(
          (total, img) => total + (img.size || 0),
          0
        );
        row["Image_URLs"] = note.images
          .map((img) => img.url || img.preview)
          .join("; ");
      } else {
        row["Image_Count"] = 0;
        row["Total_Image_Size"] = 0;
        row["Image_URLs"] = "";
      }

      rows.push(row);
    });

    return rows;
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

    // Process metadata
    if (options.includeMetadata) {
      if (item.path) {
        row["Report_Path"] = item.path;
      }
      if (item.readTime) {
        row["Read_Time"] = options.formatTimestamps
          ? this.formatTimestamp(item.readTime)
          : item.readTime;
      }
    }

    // Process report data
    if (item.data) {
      const data = item.data;

      // Basic report information
      if (data.createdBy) row["Created_By"] = data.createdBy;
      if (data.displayName) row["Creator_Display_Name"] = data.displayName;
      if (data.intersectionName)
        row["Intersection_Name"] = data.intersectionName;
      if (data.intersectionId) row["Intersection_ID"] = data.intersectionId;
      if (data.surveyDate) row["Survey_Date"] = data.surveyDate;
      if (data.inspectorCode) row["Inspector_Code"] = data.inspectorCode;
      if (data.status) row["Status"] = data.status;
      if (data.title) row["Title"] = data.title;
      if (data.description) row["Description"] = data.description;

      // Timestamps
      if (data.createdAt) {
        row["Created_At"] = options.formatTimestamps
          ? this.formatTimestamp(data.createdAt)
          : data.createdAt;
      }
      if (data.updatedAt) {
        row["Updated_At"] = options.formatTimestamps
          ? this.formatTimestamp(data.updatedAt)
          : data.updatedAt;
      }

      // Process answers
      if (data.answers && Array.isArray(data.answers)) {
        row["Answer_Count"] = data.answers.length;

        // Flatten answers if requested
        if (options.flattenStatistics) {
          data.answers.forEach((answer) => {
            const key = `Answer_${answer.questionId}`;
            row[key] = answer.value || "";
          });
        } else {
          row["Answers"] = JSON.stringify(data.answers);
        }
      }

      // Process other arrays
      if (data.files && Array.isArray(data.files)) {
        row["File_Count"] = data.files.length;
      }
      if (data.tags && Array.isArray(data.tags)) {
        row["Tags"] = data.tags.join(", ");
      }
      if (data.regionIds && Array.isArray(data.regionIds)) {
        row["Region_IDs"] = data.regionIds.join(", ");
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

    // Process metadata
    if (options.includeMetadata) {
      if (item.path) {
        row["User_Path"] = item.path;
      }
      if (item.readTime) {
        row["Read_Time"] = options.formatTimestamps
          ? this.formatTimestamp(item.readTime)
          : item.readTime;
      }
    }

    // Process user data
    if (item.data) {
      const data = item.data;

      // Basic user information
      if (data.uid) row["User_ID"] = data.uid;
      if (data.email) row["Email"] = data.email;
      if (data.displayName) row["Display_Name"] = data.displayName;
      if (data.role) row["Role"] = data.role;
      if (data.missionsCompleted !== undefined)
        row["Missions_Completed"] = data.missionsCompleted;
      if (data.missionsInProgress !== undefined)
        row["Missions_In_Progress"] = data.missionsInProgress;

      // Timestamps
      if (data.createdAt) {
        row["Created_At"] = options.formatTimestamps
          ? this.formatTimestamp(data.createdAt)
          : data.createdAt;
      }
      if (data.updatedAt) {
        row["Updated_At"] = options.formatTimestamps
          ? this.formatTimestamp(data.updatedAt)
          : data.updatedAt;
      }

      // Statistics
      if (data.statistics && options.flattenStatistics) {
        const stats = data.statistics;
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
      } else if (data.statistics) {
        row["Statistics"] = JSON.stringify(data.statistics);
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
  createSummaryRow(rows, options) {
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

    // Count different data types
    const userRows = rows.filter(
      (row) => row.User_Path && row.User_Path.includes("users/")
    );
    const reportRows = rows.filter(
      (row) => row.Report_Path && row.Report_Path.includes("reports/")
    );
    const noteRows = rows.filter(
      (row) =>
        row.Report_Notes_Path && row.Report_Notes_Path.includes("report-notes/")
    );

    if (userRows.length > 0) summaryRow["User_Records"] = userRows.length;
    if (reportRows.length > 0) summaryRow["Report_Records"] = reportRows.length;
    if (noteRows.length > 0) summaryRow["Note_Records"] = noteRows.length;

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
   * Render table
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

    // Create data rows
    this.tableData.forEach((row, index) => {
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
    const dataRows = this.tableData.filter(
      (row) => row.Record_Index !== "SUMMARY" && row.User_Path !== "SUMMARY"
    );
    rowCount.textContent = dataRows.length;
    columnCount.textContent = this.headers.length;
    dataType.textContent = Array.isArray(this.jsonData) ? "Array" : "Object";
  }

  /**
   * Show preview section
   */
  showPreview() {
    const previewSection = document.getElementById("signalPreviewSection");
    if (previewSection) {
      previewSection.style.display = "block";
      previewSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /**
   * Copy table to clipboard
   */
  async copyTable() {
    if (this.tableData.length === 0) {
      this.showNotification("No table data to copy", "warning");
      return;
    }

    try {
      let csvContent = this.headers.join("\t") + "\n";

      this.tableData.forEach((row) => {
        const values = this.headers.map((header) => {
          const value = row[header] ?? "";
          return String(value).replace(/\t/g, " ").replace(/\n/g, " ");
        });
        csvContent += values.join("\t") + "\n";
      });

      await navigator.clipboard.writeText(csvContent);
      this.showNotification(
        "Signal survey table copied to clipboard! Paste into Excel.",
        "success"
      );
    } catch (error) {
      console.error("Failed to copy table:", error);
      this.showNotification("Failed to copy table", "error");
    }
  }

  /**
   * Download CSV file
   */
  downloadCsv() {
    if (this.tableData.length === 0) {
      this.showNotification("No table data to download", "warning");
      return;
    }

    try {
      let csvContent = this.headers.join(",") + "\n";

      this.tableData.forEach((row) => {
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

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signal-survey-data-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showNotification(
        "Signal survey CSV file downloaded successfully!",
        "success"
      );
    } catch (error) {
      console.error("Failed to download CSV:", error);
      this.showNotification("Failed to download CSV", "error");
    }
  }

  /**
   * Clear all data
   */
  clearAll() {
    const jsonInput = document.getElementById("signalJsonInput");
    const previewSection = document.getElementById("signalPreviewSection");
    const convertBtn = document.getElementById("signalConvertBtn");

    if (jsonInput) {
      jsonInput.value = "";
      jsonInput.focus();
    }

    if (previewSection) {
      previewSection.style.display = "none";
    }

    if (convertBtn) {
      convertBtn.disabled = true;
    }

    this.jsonData = null;
    this.tableData = [];
    this.headers = [];
    this.isValidJson = false;

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
