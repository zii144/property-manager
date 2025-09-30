import { Module } from "../core/Module.js";

/**
 * Data Mapping Module
 * Map and combine two datasets based on common identifiers
 */
export class DataMappingModule extends Module {
  constructor() {
    super(
      "data-mapping",
      "Data Mapping",
      "Map and combine two datasets based on common identifiers"
    );
    this.icon = "🔗";
    this.dataset1 = [];
    this.dataset2 = [];
    this.mappedData = [];
    this.mappingConfig = {
      dataset1KeyColumn: 0,
      dataset2KeyColumn: 0,
      delimiter: "\t",
      hasHeaders: false,
    };
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
      <div class="data-mapper">
        <div class="mapper-header">
          <h2 class="mapper-title">Data Mapping Tool</h2>
          <div class="mapper-info">
            <span class="info-text">Map two datasets and combine them based on common identifiers</span>
          </div>
        </div>

        <div class="mapping-config">
          <h3 class="config-title">Mapping Configuration</h3>
          <div class="config-grid">
            <div class="config-group">
              <label for="delimiter" class="config-label">Delimiter</label>
              <select id="delimiter" class="config-select">
                <option value="\t">Tab (\\t)</option>
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="|">Pipe (|)</option>
                <option value=" ">Space ( )</option>
              </select>
            </div>
            <div class="config-group">
              <label for="hasHeaders" class="config-label">
                <input type="checkbox" id="hasHeaders">
                <span class="checkmark"></span>
                Has Headers
              </label>
            </div>
            <div class="config-group">
              <label for="dataset1KeyColumn" class="config-label">Dataset 1 Key Column</label>
              <input type="number" id="dataset1KeyColumn" class="config-input" min="0" value="0">
            </div>
            <div class="config-group">
              <label for="dataset2KeyColumn" class="config-label">Dataset 2 Key Column</label>
              <input type="number" id="dataset2KeyColumn" class="config-input" min="0" value="0">
            </div>
          </div>
        </div>

        <div class="datasets-section">
          <div class="dataset-container">
            <div class="dataset-header">
              <h3 class="dataset-title">Dataset 1 (with identifiers)</h3>
              <div class="dataset-info">
                <span class="dataset-count" id="dataset1Count">0 rows</span>
                <button id="clearDataset1Btn" class="btn btn-clear" title="Clear dataset 1">
                  <svg class="clear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
            <textarea 
              id="dataset1Input" 
              class="dataset-input" 
              placeholder="Paste your first dataset here...&#10;&#10;Example:&#10;凃志傑	iooop0713@gmail.com	9YyMJQIDHkcnHCau0LmJqBBszZS2&#10;林郁尊	lyt@iactor.com.tw	0HSjFwSQA8RUoil9u1XvLUARKkb2&#10;火魔	huomo1816@gmail.com	0OMY03yuT1d56xHbI110TdhMMae2"
              rows="8"
            ></textarea>
            <div class="dataset-preview" id="dataset1Preview">
              <div class="preview-title">Preview:</div>
              <div class="preview-content" id="dataset1PreviewContent">No data</div>
            </div>
          </div>

          <div class="dataset-container">
            <div class="dataset-header">
              <h3 class="dataset-title">Dataset 2 (with values)</h3>
              <div class="dataset-info">
                <span class="dataset-count" id="dataset2Count">0 rows</span>
                <button id="clearDataset2Btn" class="btn btn-clear" title="Clear dataset 2">
                  <svg class="clear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
            <textarea 
              id="dataset2Input" 
              class="dataset-input" 
              placeholder="Paste your second dataset here...&#10;&#10;Example:&#10;9YyMJQIDHkcnHCau0LmJqBBszZS2 11&#10;0HSjFwSQA8RUoil9u1XvLUARKkb2 10&#10;0OMY03yuT1d56xHbI110TdhMMae2 10"
              rows="8"
            ></textarea>
            <div class="dataset-preview" id="dataset2Preview">
              <div class="preview-title">Preview:</div>
              <div class="preview-content" id="dataset2PreviewContent">No data</div>
            </div>
          </div>
        </div>

        <div class="mapping-actions">
          <button id="mapDataBtn" class="btn btn-primary">
            <svg class="map-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            Map Data
          </button>
          <button id="clearAllBtn" class="btn btn-secondary">
            <svg class="clear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
            Clear All
          </button>
          <button id="swapDatasetsBtn" class="btn btn-swap">
            <svg class="swap-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 3h5v5"></path>
              <path d="M8 21H3v-5"></path>
              <path d="M21 3l-7 7-4-4"></path>
              <path d="M3 21l7-7 4 4"></path>
            </svg>
            Swap Datasets
          </button>
        </div>

        <div class="mapping-result" id="mappingResult" style="display: none;">
          <div class="result-header">
            <h3 class="result-title">Mapped Data</h3>
            <div class="result-actions">
              <button id="copyResultBtn" class="btn btn-copy">
                <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy Result
              </button>
              <button id="downloadResultBtn" class="btn btn-download">
                <svg class="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
              </button>
            </div>
          </div>
          
          <div class="result-stats">
            <div class="stat-item">
              <strong>Total Mapped:</strong> <span id="mappedCount">0</span>
            </div>
            <div class="stat-item">
              <strong>Dataset 1 Unmapped:</strong> <span id="unmapped1Count">0</span>
            </div>
            <div class="stat-item">
              <strong>Dataset 2 Unmapped:</strong> <span id="unmapped2Count">0</span>
            </div>
          </div>

          <div class="result-table-container">
            <div class="table-wrapper">
              <table class="result-table" id="resultTable">
                <thead id="resultTableHead"></thead>
                <tbody id="resultTableBody"></tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="examples-section">
          <h3 class="examples-title">Usage Examples</h3>
          <div class="examples-grid">
            <div class="example-card" data-example="basic-mapping">
              <h4>Basic Mapping</h4>
              <p>Map user data with scores</p>
              <div class="example-content">
                <div class="example-dataset">
                  <strong>Dataset 1:</strong>
                  <code>John	john@email.com	user123<br>Jane	jane@email.com	user456</code>
                </div>
                <div class="example-dataset">
                  <strong>Dataset 2:</strong>
                  <code>user123 95<br>user456 87</code>
                </div>
              </div>
            </div>
            <div class="example-card" data-example="product-mapping">
              <h4>Product Mapping</h4>
              <p>Map products with inventory</p>
              <div class="example-content">
                <div class="example-dataset">
                  <strong>Dataset 1:</strong>
                  <code>Product A	SKU001	$29.99<br>Product B	SKU002	$49.99</code>
                </div>
                <div class="example-dataset">
                  <strong>Dataset 2:</strong>
                  <code>SKU001 150<br>SKU002 75</code>
                </div>
              </div>
            </div>
            <div class="example-card" data-example="csv-mapping">
              <h4>CSV Mapping</h4>
              <p>Map CSV data with comma delimiter</p>
              <div class="example-content">
                <div class="example-dataset">
                  <strong>Dataset 1:</strong>
                  <code>Name,Email,ID<br>John,john@email.com,123<br>Jane,jane@email.com,456</code>
                </div>
                <div class="example-dataset">
                  <strong>Dataset 2:</strong>
                  <code>ID,Score<br>123,95<br>456,87</code>
                </div>
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
    const dataset1Input = document.getElementById("dataset1Input");
    const dataset2Input = document.getElementById("dataset2Input");
    const mapDataBtn = document.getElementById("mapDataBtn");
    const clearAllBtn = document.getElementById("clearAllBtn");
    const swapDatasetsBtn = document.getElementById("swapDatasetsBtn");
    const clearDataset1Btn = document.getElementById("clearDataset1Btn");
    const clearDataset2Btn = document.getElementById("clearDataset2Btn");
    const copyResultBtn = document.getElementById("copyResultBtn");
    const downloadResultBtn = document.getElementById("downloadResultBtn");

    // Configuration inputs
    const delimiter = document.getElementById("delimiter");
    const hasHeaders = document.getElementById("hasHeaders");
    const dataset1KeyColumn = document.getElementById("dataset1KeyColumn");
    const dataset2KeyColumn = document.getElementById("dataset2KeyColumn");

    if (mapDataBtn) {
      this.addEventListener(mapDataBtn, "click", () => this.mapData());
    }
    if (clearAllBtn) {
      this.addEventListener(clearAllBtn, "click", () => this.clearAll());
    }
    if (swapDatasetsBtn) {
      this.addEventListener(swapDatasetsBtn, "click", () =>
        this.swapDatasets()
      );
    }
    if (clearDataset1Btn) {
      this.addEventListener(clearDataset1Btn, "click", () =>
        this.clearDataset1()
      );
    }
    if (clearDataset2Btn) {
      this.addEventListener(clearDataset2Btn, "click", () =>
        this.clearDataset2()
      );
    }
    if (copyResultBtn) {
      this.addEventListener(copyResultBtn, "click", () => this.copyResult());
    }
    if (downloadResultBtn) {
      this.addEventListener(downloadResultBtn, "click", () =>
        this.downloadResult()
      );
    }

    // Auto-update on input change
    if (dataset1Input) {
      this.addEventListener(dataset1Input, "input", () => {
        this.parseDataset1();
        this.updatePreview();
      });
    }
    if (dataset2Input) {
      this.addEventListener(dataset2Input, "input", () => {
        this.parseDataset2();
        this.updatePreview();
      });
    }

    // Configuration change handlers
    if (delimiter) {
      this.addEventListener(delimiter, "change", () => {
        this.updateConfig();
        this.parseDatasets();
        this.updatePreview();
      });
    }
    if (hasHeaders) {
      this.addEventListener(hasHeaders, "change", () => {
        this.updateConfig();
        this.parseDatasets();
        this.updatePreview();
      });
    }
    if (dataset1KeyColumn) {
      this.addEventListener(dataset1KeyColumn, "change", () => {
        this.updateConfig();
      });
    }
    if (dataset2KeyColumn) {
      this.addEventListener(dataset2KeyColumn, "change", () => {
        this.updateConfig();
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
   * Update configuration
   */
  updateConfig() {
    const delimiter = document.getElementById("delimiter");
    const hasHeaders = document.getElementById("hasHeaders");
    const dataset1KeyColumn = document.getElementById("dataset1KeyColumn");
    const dataset2KeyColumn = document.getElementById("dataset2KeyColumn");

    this.mappingConfig = {
      delimiter: delimiter?.value || "\t",
      hasHeaders: hasHeaders?.checked || false,
      dataset1KeyColumn: parseInt(dataset1KeyColumn?.value) || 0,
      dataset2KeyColumn: parseInt(dataset2KeyColumn?.value) || 0,
    };
  }

  /**
   * Parse dataset 1
   */
  parseDataset1() {
    const input = document.getElementById("dataset1Input");
    if (!input) return;

    const text = input.value.trim();
    if (!text) {
      this.dataset1 = [];
      return;
    }

    this.dataset1 = this.parseTextToRows(text);
    this.updateDatasetCount("dataset1Count", this.dataset1.length);
  }

  /**
   * Parse dataset 2
   */
  parseDataset2() {
    const input = document.getElementById("dataset2Input");
    if (!input) return;

    const text = input.value.trim();
    if (!text) {
      this.dataset2 = [];
      return;
    }

    this.dataset2 = this.parseTextToRows(text);
    this.updateDatasetCount("dataset2Count", this.dataset2.length);
  }

  /**
   * Parse both datasets
   */
  parseDatasets() {
    this.parseDataset1();
    this.parseDataset2();
  }

  /**
   * Parse text to rows
   */
  parseTextToRows(text) {
    const lines = text.split("\n").filter((line) => line.trim());
    const rows = lines.map((line) => {
      const columns = line.split(this.mappingConfig.delimiter);
      return columns.map((col) => col.trim());
    });

    if (this.mappingConfig.hasHeaders && rows.length > 0) {
      return rows.slice(1); // Remove header row
    }

    return rows;
  }

  /**
   * Update dataset count
   */
  updateDatasetCount(elementId, count) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = `${count} rows`;
    }
  }

  /**
   * Update preview
   */
  updatePreview() {
    this.updateDatasetPreview("dataset1PreviewContent", this.dataset1);
    this.updateDatasetPreview("dataset2PreviewContent", this.dataset2);
  }

  /**
   * Update dataset preview
   */
  updateDatasetPreview(elementId, data) {
    const element = document.getElementById(elementId);
    if (!element) return;

    if (data.length === 0) {
      element.textContent = "No data";
      return;
    }

    const previewRows = data.slice(0, 3); // Show first 3 rows
    const preview = previewRows.map((row) => row.join(" | ")).join("\n");

    element.textContent = preview;

    if (data.length > 3) {
      element.textContent += `\n... and ${data.length - 3} more rows`;
    }
  }

  /**
   * Map data
   */
  mapData() {
    if (this.dataset1.length === 0 || this.dataset2.length === 0) {
      this.showNotification("Please provide both datasets", "warning");
      return;
    }

    try {
      this.updateConfig();
      const result = this.performMapping();
      this.mappedData = result.mapped;

      this.renderResult(result);
      this.showResult();

      this.showNotification(
        `Successfully mapped ${result.mapped.length} records`,
        "success"
      );
    } catch (error) {
      console.error("Mapping error:", error);
      this.showNotification(`Mapping failed: ${error.message}`, "error");
    }
  }

  /**
   * Perform the actual mapping
   */
  performMapping() {
    const { dataset1KeyColumn, dataset2KeyColumn } = this.mappingConfig;

    // Create lookup map for dataset 2
    const dataset2Map = new Map();
    this.dataset2.forEach((row) => {
      if (row[dataset2KeyColumn]) {
        dataset2Map.set(row[dataset2KeyColumn], row);
      }
    });

    const mapped = [];
    const unmapped1 = [];
    const unmapped2 = [...this.dataset2]; // Start with all dataset2 rows

    // Map dataset 1 with dataset 2
    this.dataset1.forEach((row1) => {
      const key = row1[dataset1KeyColumn];
      const matchingRow2 = dataset2Map.get(key);

      if (matchingRow2) {
        // Combine the rows
        const combinedRow = [...row1, ...matchingRow2];
        mapped.push(combinedRow);

        // Remove from unmapped2
        const index = unmapped2.findIndex(
          (row) => row[dataset2KeyColumn] === key
        );
        if (index !== -1) {
          unmapped2.splice(index, 1);
        }
      } else {
        unmapped1.push(row1);
      }
    });

    return {
      mapped,
      unmapped1,
      unmapped2,
    };
  }

  /**
   * Render result table
   */
  renderResult(result) {
    const tableHead = document.getElementById("resultTableHead");
    const tableBody = document.getElementById("resultTableBody");
    const mappedCount = document.getElementById("mappedCount");
    const unmapped1Count = document.getElementById("unmapped1Count");
    const unmapped2Count = document.getElementById("unmapped2Count");

    if (
      !tableHead ||
      !tableBody ||
      !mappedCount ||
      !unmapped1Count ||
      !unmapped2Count
    )
      return;

    // Clear existing content
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    if (result.mapped.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="100%" style="text-align: center; padding: 2rem; color: var(--gray-500);">No mapped data found</td></tr>';
      return;
    }

    // Create header row
    const headerRow = document.createElement("tr");
    const maxColumns = Math.max(...result.mapped.map((row) => row.length));

    for (let i = 0; i < maxColumns; i++) {
      const th = document.createElement("th");
      th.textContent = `Column ${i + 1}`;
      th.title = `Column ${i + 1}`;
      headerRow.appendChild(th);
    }
    tableHead.appendChild(headerRow);

    // Create data rows
    result.mapped.forEach((row) => {
      const tr = document.createElement("tr");

      // Fill existing columns
      row.forEach((cell) => {
        const td = document.createElement("td");
        td.textContent = String(cell);
        td.title = String(cell);
        tr.appendChild(td);
      });

      // Fill remaining columns if any
      for (let i = row.length; i < maxColumns; i++) {
        const td = document.createElement("td");
        td.textContent = "";
        tr.appendChild(td);
      }

      tableBody.appendChild(tr);
    });

    // Update stats
    mappedCount.textContent = result.mapped.length;
    unmapped1Count.textContent = result.unmapped1.length;
    unmapped2Count.textContent = result.unmapped2.length;
  }

  /**
   * Show result section
   */
  showResult() {
    const mappingResult = document.getElementById("mappingResult");
    if (mappingResult) {
      mappingResult.style.display = "block";
      mappingResult.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /**
   * Copy result to clipboard
   */
  async copyResult() {
    if (this.mappedData.length === 0) {
      this.showNotification("No mapped data to copy", "warning");
      return;
    }

    try {
      const resultText = this.mappedData
        .map((row) => row.join(this.mappingConfig.delimiter))
        .join("\n");

      await navigator.clipboard.writeText(resultText);
      this.showNotification("Mapped data copied to clipboard!", "success");
    } catch (error) {
      console.error("Failed to copy result:", error);
      this.showNotification("Failed to copy result", "error");
    }
  }

  /**
   * Download result
   */
  downloadResult() {
    if (this.mappedData.length === 0) {
      this.showNotification("No mapped data to download", "warning");
      return;
    }

    try {
      const resultText = this.mappedData
        .map((row) => row.join(this.mappingConfig.delimiter))
        .join("\n");

      const blob = new Blob([resultText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mapped-data-${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showNotification("Mapped data downloaded successfully!", "success");
    } catch (error) {
      console.error("Failed to download result:", error);
      this.showNotification("Failed to download result", "error");
    }
  }

  /**
   * Clear all data
   */
  clearAll() {
    this.clearDataset1();
    this.clearDataset2();
    this.mappedData = [];

    const mappingResult = document.getElementById("mappingResult");
    if (mappingResult) {
      mappingResult.style.display = "none";
    }
  }

  /**
   * Clear dataset 1
   */
  clearDataset1() {
    const input = document.getElementById("dataset1Input");
    if (input) {
      input.value = "";
      input.focus();
    }
    this.dataset1 = [];
    this.updateDatasetCount("dataset1Count", 0);
    this.updateDatasetPreview("dataset1PreviewContent", []);
  }

  /**
   * Clear dataset 2
   */
  clearDataset2() {
    const input = document.getElementById("dataset2Input");
    if (input) {
      input.value = "";
    }
    this.dataset2 = [];
    this.updateDatasetCount("dataset2Count", 0);
    this.updateDatasetPreview("dataset2PreviewContent", []);
  }

  /**
   * Swap datasets
   */
  swapDatasets() {
    const dataset1Input = document.getElementById("dataset1Input");
    const dataset2Input = document.getElementById("dataset2Input");
    const dataset1Placeholder = dataset1Input?.placeholder;
    const dataset2Placeholder = dataset2Input?.placeholder;

    if (dataset1Input && dataset2Input) {
      const tempValue = dataset1Input.value;
      dataset1Input.value = dataset2Input.value;
      dataset2Input.value = tempValue;

      dataset1Input.placeholder = dataset2Placeholder;
      dataset2Input.placeholder = dataset1Placeholder;
    }

    // Swap the data arrays
    const tempData = this.dataset1;
    this.dataset1 = this.dataset2;
    this.dataset2 = tempData;

    // Update previews
    this.updatePreview();
    this.updateDatasetCount("dataset1Count", this.dataset1.length);
    this.updateDatasetCount("dataset2Count", this.dataset2.length);
  }

  /**
   * Load example data
   */
  loadExample(exampleType) {
    const examples = {
      "basic-mapping": {
        dataset1:
          "John\tjohn@email.com\tuser123\nJane\tjane@email.com\tuser456\nBob\tbob@email.com\tuser789",
        dataset2: "user123 95\nuser456 87\nuser789 92",
        delimiter: "\t",
        dataset1KeyColumn: 2,
        dataset2KeyColumn: 0,
      },
      "product-mapping": {
        dataset1:
          "Product A\tSKU001\t$29.99\nProduct B\tSKU002\t$49.99\nProduct C\tSKU003\t$19.99",
        dataset2: "SKU001 150\nSKU002 75\nSKU003 200",
        delimiter: "\t",
        dataset1KeyColumn: 1,
        dataset2KeyColumn: 0,
      },
      "csv-mapping": {
        dataset1:
          "Name,Email,ID\nJohn,john@email.com,123\nJane,jane@email.com,456\nBob,bob@email.com,789",
        dataset2: "ID,Score\n123,95\n456,87\n789,92",
        delimiter: ",",
        dataset1KeyColumn: 2,
        dataset2KeyColumn: 0,
        hasHeaders: true,
      },
    };

    const example = examples[exampleType];
    if (!example) return;

    const dataset1Input = document.getElementById("dataset1Input");
    const dataset2Input = document.getElementById("dataset2Input");
    const delimiter = document.getElementById("delimiter");
    const hasHeaders = document.getElementById("hasHeaders");
    const dataset1KeyColumn = document.getElementById("dataset1KeyColumn");
    const dataset2KeyColumn = document.getElementById("dataset2KeyColumn");

    if (dataset1Input) dataset1Input.value = example.dataset1;
    if (dataset2Input) dataset2Input.value = example.dataset2;
    if (delimiter) delimiter.value = example.delimiter;
    if (hasHeaders) hasHeaders.checked = example.hasHeaders || false;
    if (dataset1KeyColumn) dataset1KeyColumn.value = example.dataset1KeyColumn;
    if (dataset2KeyColumn) dataset2KeyColumn.value = example.dataset2KeyColumn;

    this.updateConfig();
    this.parseDatasets();
    this.updatePreview();
  }
}

