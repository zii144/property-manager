import { Module } from "../core/Module.js";

/**
 * JSON to Excel Module
 * Convert JSON data to Excel-friendly table format
 * Version: 2.0 - Added Signal Survey data support
 */
export class JsonToExcelModule extends Module {
  constructor() {
    super(
      "json-to-excel",
      "JSON to Excel",
      "Convert JSON data to Excel-friendly table format"
    );
    this.icon = "📋";
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
      <div class="json-converter">
        <div class="converter-header">
          <h2 class="converter-title">JSON to Excel Converter</h2>
          <div class="converter-info">
            <span class="info-text">Convert JSON data to tabular format for Excel</span>
          </div>
        </div>

        <div class="input-section">
          <div class="json-input-group">
            <label for="jsonInput" class="input-label">Paste your JSON data:</label>
            <textarea 
              id="jsonInput" 
              class="json-input" 
              placeholder="Paste your JSON data here...&#10;&#10;Example:&#10;[&#10;  {&#10;    &quot;name&quot;: &quot;John Doe&quot;,&#10;    &quot;age&quot;: 30,&#10;    &quot;city&quot;: &quot;New York&quot;,&#10;    &quot;salary&quot;: 75000&#10;  },&#10;  {&#10;    &quot;name&quot;: &quot;Jane Smith&quot;,&#10;    &quot;age&quot;: 25,&#10;    &quot;city&quot;: &quot;Los Angeles&quot;,&#10;    &quot;salary&quot;: 65000&#10;  }&#10;]"
              rows="12"
            ></textarea>
            <div class="json-status" id="jsonStatus">
              <span class="status-icon">⏳</span>
              <span class="status-text">Ready to convert</span>
            </div>
          </div>


          <div class="conversion-actions">
            <button id="convertBtn" class="btn btn-primary">
              <svg class="convert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              Convert to Table
            </button>
            <button id="clearBtn" class="btn btn-secondary">
              <svg class="clear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
              Clear
            </button>
            <button id="validateBtn" class="btn btn-validate">
              <svg class="validate-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              Validate JSON
            </button>
          </div>
        </div>

        <div class="preview-section" id="previewSection" style="display: none;">
          <div class="preview-header">
            <h3 class="preview-title">Table Preview</h3>
            <div class="preview-actions">
              <button id="copyTableBtn" class="btn btn-copy">
                <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy Table
              </button>
              <button id="downloadCsvBtn" class="btn btn-download">
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
                <strong>Rows:</strong> <span id="rowCount">0</span>
              </span>
              <span class="stat-item">
                <strong>Columns:</strong> <span id="columnCount">0</span>
              </span>
              <span class="stat-item">
                <strong>Data Type:</strong> <span id="dataType">-</span>
              </span>
            </div>
          </div>

          <div class="table-container">
            <div class="table-wrapper">
              <table class="data-table" id="dataTable">
                <thead id="tableHead"></thead>
                <tbody id="tableBody"></tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="examples-section">
          <h3 class="examples-title">JSON Examples</h3>
          <div class="examples-grid">
            <div class="example-card" data-example="simple-array">
              <h4>Simple Array</h4>
              <p>Array of objects with flat structure</p>
              <div class="example-code">
                <code>[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]</code>
              </div>
            </div>
            <div class="example-card" data-example="nested-objects">
              <h4>Nested Objects</h4>
              <p>Objects with nested properties</p>
              <div class="example-code">
                <code>[{"user": {"name": "John", "address": {"city": "NYC"}}}]</code>
              </div>
            </div>
            <div class="example-card" data-example="mixed-data">
              <h4>Mixed Data Types</h4>
              <p>Various data types and structures</p>
              <div class="example-code">
                <code>[{"id": 1, "active": true, "tags": ["tag1", "tag2"]}]</code>
              </div>
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
    const jsonInput = document.getElementById("jsonInput");
    const convertBtn = document.getElementById("convertBtn");
    const clearBtn = document.getElementById("clearBtn");
    const validateBtn = document.getElementById("validateBtn");
    const copyTableBtn = document.getElementById("copyTableBtn");
    const downloadCsvBtn = document.getElementById("downloadCsvBtn");

    if (convertBtn) {
      this.addEventListener(convertBtn, "click", () => this.convertJson());
    }
    if (clearBtn) {
      this.addEventListener(clearBtn, "click", () => this.clearAll());
    }
    if (validateBtn) {
      this.addEventListener(validateBtn, "click", () => this.validateJson());
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
      this.addEventListener(card, "click", () => {
        const example = card.dataset.example;
        this.loadExample(example);
      });
    });
  }

  /**
   * Validate JSON input
   */
  validateJson() {
    const jsonInput = document.getElementById("jsonInput");
    const jsonStatus = document.getElementById("jsonStatus");
    const convertBtn = document.getElementById("convertBtn");

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
    const jsonStatus = document.getElementById("jsonStatus");
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
      this.updateStatus("processing", "Converting JSON...");

      // Check if this is Signal Survey data
      const dataType = this.detectSignalSurveyDataType(this.jsonData);

      let result;
      if (dataType) {
        result = this.processSignalSurveyData(this.jsonData, dataType);
      } else {
        const options = this.getConversionOptions();
        result = this.processJsonData(this.jsonData, options);
      }

      this.tableData = result.data;
      this.headers = result.headers;

      this.renderTable();
      this.showPreview();
      this.updateStatus(
        "success",
        `Conversion completed successfully (${
          dataType ? dataType + " data" : "generic data"
        })`
      );
    } catch (error) {
      console.error("Conversion error:", error);
      this.showNotification(`Conversion failed: ${error.message}`, "error");
      this.updateStatus("error", "Conversion failed");
    }
  }

  /**
   * Detect if this is Signal Survey data and return the type
   */
  detectSignalSurveyDataType(data) {
    if (!Array.isArray(data) || data.length === 0) return null;

    const firstItem = data[0];

    // Check for Firestore format data (with path and data properties)
    if (firstItem.path && firstItem.data) {
      if (firstItem.path.startsWith("users/")) return "users";
      if (firstItem.path.startsWith("reports/")) return "reports";
      if (firstItem.path.startsWith("report-notes/")) return "report-notes";
    }

    // Check for processed format data
    // Check for users data
    if (
      firstItem.id &&
      firstItem.email &&
      firstItem.role &&
      firstItem.statistics
    ) {
      return "users";
    }

    // Check for reports data
    if (
      firstItem.id &&
      firstItem.intersectionName &&
      firstItem.answers &&
      firstItem.createdBy
    ) {
      return "reports";
    }

    // Check for report-notes data
    if (
      firstItem.id &&
      firstItem.reportId &&
      firstItem.userId &&
      firstItem.notes
    ) {
      return "report-notes";
    }

    return null;
  }

  /**
   * Get conversion options
   */
  getConversionOptions() {
    return {
      flattenNested: true,
      includeArrayIndex: true,
      convertDates: true,
      includeEmptyRows: true,
    };
  }

  /**
   * Process JSON data into table format
   */
  processJsonData(data, options) {
    let rows = [];
    let headers = new Set();

    if (Array.isArray(data)) {
      // Array of objects
      data.forEach((item, index) => {
        const row = this.processObject(item, options, index);
        rows.push(row);
        Object.keys(row).forEach((key) => headers.add(key));
      });
    } else if (typeof data === "object" && data !== null) {
      // Single object
      const row = this.processObject(data, options, 0);
      rows.push(row);
      Object.keys(row).forEach((key) => headers.add(key));
    } else {
      throw new Error("JSON must be an object or array of objects");
    }

    return {
      data: rows,
      headers: Array.from(headers).sort(),
    };
  }

  /**
   * Process Signal Survey data with specialized field mapping
   */
  processSignalSurveyData(data, dataType) {
    let rows = [];
    let headers = [];

    if (!Array.isArray(data)) {
      throw new Error("Signal Survey data must be an array");
    }

    // Check if this is Firestore format data (with path and data properties)
    const isFirestoreFormat = data.length > 0 && data[0].path && data[0].data;

    switch (dataType) {
      case "users":
        headers = [
          "User_Path",
          "Read_Time",
          "User_ID",
          "Email",
          "Display_Name",
          "Role",
          "Missions_Completed",
          "Missions_In_Progress",
          "Created_At",
          "Updated_At",
          "Flashing_Intersections",
          "Single_Flash_Intersections",
          "Total_Signal_Poles",
          "Total_Pedestrian_Signals",
          "Three_Color_Intersections",
          "Total_Controllers",
        ];

        data.forEach((item, index) => {
          let user;
          let userPath;
          let readTime;

          if (isFirestoreFormat) {
            // Firestore format
            user = item.data;
            userPath = item.path;
            readTime = item.readTime;
          } else {
            // Processed format
            user = item;
            userPath = `users/${user.id}`;
            readTime = user.readTime;
          }

          const row = {
            User_Path: userPath,
            Read_Time: this.formatDateTime(readTime),
            User_ID: user.id || user.uid || "",
            Email: user.email || "",
            Display_Name: user.displayName || "",
            Role: user.role || "",
            Missions_Completed: user.missionsCompleted || 0,
            Missions_In_Progress: user.missionsInProgress || 0,
            Created_At: this.formatDateTime(user.createdAt),
            Updated_At: this.formatDateTime(user.updatedAt),
            Flashing_Intersections: user.statistics?.flashingIntersections || 0,
            Single_Flash_Intersections:
              user.statistics?.singleFlashIntersections || 0,
            Total_Signal_Poles: user.statistics?.totalSignalPoles || 0,
            Total_Pedestrian_Signals:
              user.statistics?.totalPedestrianSignals || 0,
            Three_Color_Intersections:
              user.statistics?.threeColorIntersections || 0,
            Total_Controllers: user.statistics?.totalControllers || 0,
          };
          rows.push(row);
        });
        break;

      case "reports":
        headers = [
          "Report_Path",
          "Read_Time",
          "Report_ID",
          "Created_By",
          "Display_Name",
          "Intersection_Name",
          "Intersection_ID",
          "Survey_Date",
          "Inspector_Code",
          "Status",
          "Title",
          "Description",
          "Created_At",
          "Updated_At",
          "Tags",
          "Region_IDs",
        ];

        data.forEach((item, index) => {
          let report;
          let reportPath;
          let readTime;

          if (isFirestoreFormat) {
            // Firestore format
            report = item.data;
            reportPath = item.path;
            readTime = item.readTime;
          } else {
            // Processed format
            report = item;
            reportPath = `reports/${report.id}`;
            readTime = report.readTime;
          }

          const row = {
            Report_Path: reportPath,
            Read_Time: this.formatDateTime(readTime),
            Report_ID: report.id || "",
            Created_By: report.createdBy || "",
            Display_Name: report.displayName || "",
            Intersection_Name: report.intersectionName || "",
            Intersection_ID: report.intersectionId || "",
            Survey_Date: report.surveyDate || "",
            Inspector_Code: report.inspectorCode || "",
            Status: report.status || "",
            Title: report.title || "",
            Description: report.description || "",
            Created_At: this.formatDateTime(report.createdAt),
            Updated_At: this.formatDateTime(report.updatedAt),
            Tags: Array.isArray(report.tags) ? report.tags.join(", ") : "",
            Region_IDs: Array.isArray(report.regionIds)
              ? report.regionIds.join(", ")
              : "",
          };
          rows.push(row);
        });
        break;

      case "report-notes":
        headers = [
          "Note_Path",
          "Read_Time",
          "Note_ID",
          "Report_ID",
          "User_ID",
          "Created_At",
          "Updated_At",
          "Notes_Count",
        ];

        data.forEach((item, index) => {
          let note;
          let notePath;
          let readTime;

          if (isFirestoreFormat) {
            // Firestore format
            note = item.data;
            notePath = item.path;
            readTime = item.readTime;
          } else {
            // Processed format
            note = item;
            notePath = `report-notes/${note.id}`;
            readTime = note.readTime;
          }

          const row = {
            Note_Path: notePath,
            Read_Time: this.formatDateTime(readTime),
            Note_ID: note.id || "",
            Report_ID: note.reportId || "",
            User_ID: note.userId || "",
            Created_At: this.formatDateTime(note.createdAt),
            Updated_At: this.formatDateTime(note.updatedAt),
            Notes_Count: Array.isArray(note.notes) ? note.notes.length : 0,
          };
          rows.push(row);
        });
        break;

      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }

    return {
      data: rows,
      headers: headers,
    };
  }

  /**
   * Format date/time string for display
   */
  formatDateTime(dateValue) {
    if (!dateValue) return "";

    try {
      let date;

      // Handle Firestore timestamp objects
      if (dateValue._seconds) {
        date = new Date(
          dateValue._seconds * 1000 + (dateValue._nanoseconds || 0) / 1000000
        );
      } else {
        date = new Date(dateValue);
      }

      if (isNaN(date.getTime())) return "";

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.warn("Date formatting error:", error);
      return "";
    }
  }

  /**
   * Process a single object into a flat row
   */
  processObject(obj, options, index) {
    const row = {};

    if (options.includeArrayIndex) {
      row["_index"] = index;
    }

    this.flattenObject(obj, "", row, options);

    return row;
  }

  /**
   * Flatten nested object
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
   * Render table
   */
  renderTable() {
    const tableHead = document.getElementById("tableHead");
    const tableBody = document.getElementById("tableBody");
    const rowCount = document.getElementById("rowCount");
    const columnCount = document.getElementById("columnCount");
    const dataType = document.getElementById("dataType");

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
    rowCount.textContent = this.tableData.length;
    columnCount.textContent = this.headers.length;
    dataType.textContent = Array.isArray(this.jsonData) ? "Array" : "Object";
  }

  /**
   * Show preview section
   */
  showPreview() {
    const previewSection = document.getElementById("previewSection");
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
        "Table copied to clipboard! Paste into Excel.",
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
      a.download = `json-to-excel-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showNotification("CSV file downloaded successfully!", "success");
    } catch (error) {
      console.error("Failed to download CSV:", error);
      this.showNotification("Failed to download CSV", "error");
    }
  }

  /**
   * Clear all data
   */
  clearAll() {
    const jsonInput = document.getElementById("jsonInput");
    const previewSection = document.getElementById("previewSection");
    const convertBtn = document.getElementById("convertBtn");

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
   * Load example JSON
   */
  loadExample(exampleType) {
    const examples = {
      "simple-array": `[
  {
    "name": "John Doe",
    "age": 30,
    "city": "New York",
    "salary": 75000,
    "department": "Engineering"
  },
  {
    "name": "Jane Smith",
    "age": 25,
    "city": "Los Angeles",
    "salary": 65000,
    "department": "Marketing"
  },
  {
    "name": "Bob Johnson",
    "age": 35,
    "city": "Chicago",
    "salary": 80000,
    "department": "Sales"
  }
]`,
      "nested-objects": `[
  {
    "id": 1,
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "zipCode": "10001"
      }
    },
    "orders": [
      {"id": 101, "amount": 99.99},
      {"id": 102, "amount": 149.99}
    ]
  },
  {
    "id": 2,
    "user": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "address": {
        "street": "456 Oak Ave",
        "city": "Los Angeles",
        "zipCode": "90210"
      }
    },
    "orders": [
      {"id": 201, "amount": 79.99}
    ]
  }
]`,
      "mixed-data": `[
  {
    "id": 1,
    "name": "Product A",
    "price": 29.99,
    "inStock": true,
    "tags": ["electronics", "gadgets"],
    "createdAt": "2024-01-15T10:30:00Z",
    "metadata": {
      "weight": 1.5,
      "dimensions": {"width": 10, "height": 5, "depth": 2}
    }
  },
  {
    "id": 2,
    "name": "Product B",
    "price": 49.99,
    "inStock": false,
    "tags": ["clothing", "accessories"],
    "createdAt": "2024-01-20T14:45:00Z",
    "metadata": {
      "weight": 0.8,
      "dimensions": {"width": 15, "height": 20, "depth": 1}
    }
  }
]`,
    };

    const jsonInput = document.getElementById("jsonInput");
    if (jsonInput && examples[exampleType]) {
      jsonInput.value = examples[exampleType];
      this.validateJson();
    }
  }
}
