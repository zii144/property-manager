import { Module } from "../core/Module.js";

/**
 * Text Frequency Counter Module
 * Analyzes text and counts word/item frequency
 */
export class TextFrequencyModule extends Module {
  constructor() {
    super(
      "text-frequency",
      "Text Frequency Counter",
      "Analyze text and count word/item frequency with verification"
    );
    this.icon = "📊";
    this.currentData = { items: [], frequency: new Map() };
    this.originalText = "";
    this.isVerificationMode = false;
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
      <div class="input-section">
        <label for="textInput" class="input-label">Enter your text:</label>
        <textarea 
          id="textInput" 
          class="text-input" 
          placeholder="Paste your text here...&#10;&#10;Example:&#10;apple&#10;apple&#10;apple&#10;banana&#10;banana&#10;water&#10;water&#10;water&#10;water"
          rows="10"
        ></textarea>
        <div class="input-actions">
          <button id="analyzeBtn" class="btn btn-primary">Analyze Text</button>
          <button id="clearBtn" class="btn btn-secondary">Clear</button>
        </div>
      </div>
      
      <div class="results-section" id="resultsSection" style="display: none;">
        <div class="results-header">
          <h2 class="results-title">Frequency Analysis</h2>
          <div class="header-actions">
            <button id="verifyBtn" class="btn btn-verify" title="Verify analysis accuracy">
              <svg class="verify-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              <span class="btn-text">Verify</span>
            </button>
            <button id="copyToExcelBtn" class="btn btn-excel" title="Copy data for Excel">
              <svg class="excel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              <span class="btn-text">Copy to Excel</span>
            </button>
          </div>
        </div>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-label">Total Items:</span>
            <span class="stat-value" id="totalItems">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Unique Items:</span>
            <span class="stat-value" id="uniqueItems">0</span>
          </div>
        </div>
        <div class="results-container">
          <div id="resultsList" class="results-list"></div>
        </div>
        
        <!-- Verification Panel -->
        <div id="verificationPanel" class="verification-panel" style="display: none;">
          <div class="verification-header">
            <h3 class="verification-title">Verification Mode</h3>
            <button id="closeVerifyBtn" class="btn btn-close" title="Close verification">
              <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="verification-content">
            <div class="verification-stats">
              <div class="verify-stat">
                <span class="verify-label">Original Text Items:</span>
                <span class="verify-value" id="originalItemsCount">0</span>
              </div>
              <div class="verify-stat">
                <span class="verify-label">Parsed Items:</span>
                <span class="verify-value" id="parsedItemsCount">0</span>
              </div>
              <div class="verify-stat">
                <span class="verify-label">Verification Status:</span>
                <span class="verify-value" id="verificationStatus">Checking...</span>
              </div>
            </div>
            <div class="verification-details">
              <h4>Detailed Breakdown:</h4>
              <div id="verificationList" class="verification-list"></div>
            </div>
            <div class="verification-actions">
              <button id="reanalyzeBtn" class="btn btn-primary">Re-analyze</button>
              <button id="exportVerifyBtn" class="btn btn-secondary">Export Verification</button>
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
    const textInput = document.getElementById("textInput");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const clearBtn = document.getElementById("clearBtn");
    const verifyBtn = document.getElementById("verifyBtn");
    const closeVerifyBtn = document.getElementById("closeVerifyBtn");
    const reanalyzeBtn = document.getElementById("reanalyzeBtn");
    const exportVerifyBtn = document.getElementById("exportVerifyBtn");
    const copyToExcelBtn = document.getElementById("copyToExcelBtn");

    if (analyzeBtn) {
      this.addEventListener(analyzeBtn, "click", () => this.analyzeText());
    }
    if (clearBtn) {
      this.addEventListener(clearBtn, "click", () => this.clearAll());
    }
    if (verifyBtn) {
      this.addEventListener(verifyBtn, "click", () =>
        this.toggleVerification()
      );
    }
    if (closeVerifyBtn) {
      this.addEventListener(closeVerifyBtn, "click", () =>
        this.closeVerification()
      );
    }
    if (reanalyzeBtn) {
      this.addEventListener(reanalyzeBtn, "click", () => this.reanalyze());
    }
    if (exportVerifyBtn) {
      this.addEventListener(exportVerifyBtn, "click", () =>
        this.exportVerification()
      );
    }
    if (copyToExcelBtn) {
      this.addEventListener(copyToExcelBtn, "click", () => this.copyToExcel());
    }

    // Auto-analyze on input change with debouncing
    if (textInput) {
      let timeoutId;
      this.addEventListener(textInput, "input", () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (textInput.value.trim()) {
            this.analyzeText();
          } else {
            this.hideResults();
          }
        }, 500);
      });

      // Handle Enter key for quick analysis
      this.addEventListener(textInput, "keydown", (e) => {
        if (e.ctrlKey && e.key === "Enter") {
          this.analyzeText();
        }
      });
    }

    // Close verification panel on escape key
    this.addEventListener(document, "keydown", (e) => {
      if (e.key === "Escape" && this.isVerificationMode) {
        this.closeVerification();
      }
    });
  }

  /**
   * Parse text input and count frequency of items
   */
  parseText(text) {
    if (!text || !text.trim()) {
      return { items: [], frequency: new Map() };
    }

    const items = text
      .split(/[\s\n\r]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const frequency = new Map();
    items.forEach((item) => {
      const count = frequency.get(item) || 0;
      frequency.set(item, count + 1);
    });

    return { items, frequency };
  }

  /**
   * Sort frequency map by count (descending) then by name (ascending)
   */
  sortFrequency(frequency) {
    return new Map(
      [...frequency.entries()].sort((a, b) => {
        if (b[1] !== a[1]) {
          return b[1] - a[1];
        }
        return a[0].localeCompare(b[0]);
      })
    );
  }

  /**
   * Create a visual bar for frequency representation
   */
  createFrequencyBar(count, maxCount) {
    const percentage = (count / maxCount) * 100;
    return `
      <div class="frequency-bar">
        <div class="frequency-fill" style="width: ${percentage}%"></div>
      </div>
    `;
  }

  /**
   * Render results to the DOM
   */
  renderResults(items, frequency) {
    const resultsList = document.getElementById("resultsList");
    const totalItems = document.getElementById("totalItems");
    const uniqueItems = document.getElementById("uniqueItems");

    if (!resultsList || !totalItems || !uniqueItems) return;

    const sortedFrequency = this.sortFrequency(frequency);
    const maxCount = Math.max(...sortedFrequency.values());

    let html = "";
    sortedFrequency.forEach((count, item) => {
      const percentage = ((count / items.length) * 100).toFixed(1);
      html += `
        <div class="result-item">
          <div class="result-content">
            <span class="item-name">${this.escapeHtml(item)}</span>
            <span class="item-count">${count}</span>
            <span class="item-percentage">${percentage}%</span>
          </div>
          ${this.createFrequencyBar(count, maxCount)}
        </div>
      `;
    });

    resultsList.innerHTML = html;
    totalItems.textContent = items.length;
    uniqueItems.textContent = sortedFrequency.size;
  }

  /**
   * Main analysis function
   */
  analyzeText() {
    const textInput = document.getElementById("textInput");
    if (!textInput) return;

    const text = textInput.value;
    this.originalText = text;
    const { items, frequency } = this.parseText(text);

    if (items.length === 0) {
      this.hideResults();
      return;
    }

    this.currentData = { items, frequency };
    this.renderResults(items, frequency);
    this.showResults();
  }

  /**
   * Show results section
   */
  showResults() {
    const resultsSection = document.getElementById("resultsSection");
    if (resultsSection) {
      resultsSection.style.display = "block";
      resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  /**
   * Hide results section
   */
  hideResults() {
    const resultsSection = document.getElementById("resultsSection");
    if (resultsSection) {
      resultsSection.style.display = "none";
    }
  }

  /**
   * Clear all input and results
   */
  clearAll() {
    const textInput = document.getElementById("textInput");
    if (textInput) {
      textInput.value = "";
      textInput.focus();
    }
    this.currentData = { items: [], frequency: new Map() };
    this.hideResults();
  }

  /**
   * Copy data to clipboard in Excel-friendly format
   */
  async copyToExcel() {
    if (this.currentData.items.length === 0) {
      this.showNotification("No data to copy", "warning");
      return;
    }

    try {
      const sortedFrequency = this.sortFrequency(this.currentData.frequency);
      const totalItems = this.currentData.items.length;

      let excelData = "Item\tCount\tPercentage\n";

      sortedFrequency.forEach((count, item) => {
        const percentage = ((count / totalItems) * 100).toFixed(2);
        excelData += `${item}\t${count}\t${percentage}%\n`;
      });

      excelData += `\nTotal Items\t${totalItems}\t100%\n`;
      excelData += `Unique Items\t${sortedFrequency.size}\t${(
        (sortedFrequency.size / totalItems) *
        100
      ).toFixed(2)}%\n`;

      await navigator.clipboard.writeText(excelData);
      this.showNotification(
        "Data copied to clipboard! Paste into Excel.",
        "success"
      );
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      this.showNotification("Failed to copy data. Please try again.", "error");
    }
  }

  /**
   * Toggle verification mode
   */
  toggleVerification() {
    if (this.currentData.items.length === 0) {
      this.showNotification("No data to verify", "warning");
      return;
    }

    if (this.isVerificationMode) {
      this.closeVerification();
    } else {
      this.openVerification();
    }
  }

  /**
   * Open verification panel
   */
  openVerification() {
    this.isVerificationMode = true;
    const verificationPanel = document.getElementById("verificationPanel");
    const verifyBtn = document.getElementById("verifyBtn");

    if (verificationPanel) {
      verificationPanel.style.display = "block";
    }
    if (verifyBtn) {
      verifyBtn.classList.add("active");
      const btnText = verifyBtn.querySelector(".btn-text");
      if (btnText) {
        btnText.textContent = "Close Verify";
      }
    }

    this.performVerification();
  }

  /**
   * Close verification panel
   */
  closeVerification() {
    this.isVerificationMode = false;
    const verificationPanel = document.getElementById("verificationPanel");
    const verifyBtn = document.getElementById("verifyBtn");

    if (verificationPanel) {
      verificationPanel.style.display = "none";
    }
    if (verifyBtn) {
      verifyBtn.classList.remove("active");
      const btnText = verifyBtn.querySelector(".btn-text");
      if (btnText) {
        btnText.textContent = "Verify";
      }
    }
  }

  /**
   * Perform detailed verification
   */
  performVerification() {
    const originalItems = this.originalText
      .split(/[\s\n\r]+/)
      .filter((item) => item.trim().length > 0);
    const parsedItems = this.currentData.items;
    const frequency = this.currentData.frequency;

    const originalItemsCount = document.getElementById("originalItemsCount");
    const parsedItemsCount = document.getElementById("parsedItemsCount");
    const verificationStatus = document.getElementById("verificationStatus");

    if (originalItemsCount)
      originalItemsCount.textContent = originalItems.length;
    if (parsedItemsCount) parsedItemsCount.textContent = parsedItems.length;

    const countsMatch = originalItems.length === parsedItems.length;

    if (verificationStatus) {
      if (countsMatch) {
        verificationStatus.textContent = "✓ Verified";
        verificationStatus.className = "verify-value verified";
      } else {
        verificationStatus.textContent = "⚠ Mismatch";
        verificationStatus.className = "verify-value error";
      }
    }

    this.renderVerificationDetails(originalItems, parsedItems, frequency);
  }

  /**
   * Render verification details
   */
  renderVerificationDetails(originalItems, parsedItems, frequency) {
    const verificationList = document.getElementById("verificationList");
    if (!verificationList) return;

    const sortedFrequency = this.sortFrequency(frequency);

    let html = '<div class="verification-summary">';
    html += `<p><strong>Original text split into ${originalItems.length} items</strong></p>`;
    html += `<p><strong>Parsed into ${parsedItems.length} items</strong></p>`;
    html += "</div>";

    html += '<div class="frequency-breakdown">';
    html += "<h5>Frequency Count Verification:</h5>";

    sortedFrequency.forEach((count, item) => {
      const manualCount = parsedItems.filter(
        (parsedItem) => parsedItem === item
      ).length;
      const isCorrect = count === manualCount;

      html += `
        <div class="verify-item ${isCorrect ? "correct" : "incorrect"}">
          <div class="verify-item-header">
            <span class="verify-item-name">"${this.escapeHtml(item)}"</span>
            <div class="verify-counts">
              <span class="verify-count">Algorithm: ${count}</span>
              <span class="verify-count">Manual: ${manualCount}</span>
              <span class="verify-status">${isCorrect ? "✓" : "✗"}</span>
            </div>
          </div>
          <div class="verify-occurrences">
            ${this.getOccurrenceDetails(item, parsedItems)}
          </div>
        </div>
      `;
    });

    html += "</div>";

    html += '<div class="raw-data-section">';
    html += "<h5>Raw Data (for manual verification):</h5>";
    html += '<div class="raw-data">';
    html += '<div class="raw-original">';
    html += "<strong>Original Items:</strong><br>";
    html += originalItems
      .map((item, index) => `${index + 1}. "${this.escapeHtml(item)}"`)
      .join("<br>");
    html += "</div>";
    html += '<div class="raw-parsed">';
    html += "<strong>Parsed Items:</strong><br>";
    html += parsedItems
      .map((item, index) => `${index + 1}. "${this.escapeHtml(item)}"`)
      .join("<br>");
    html += "</div>";
    html += "</div>";
    html += "</div>";

    verificationList.innerHTML = html;
  }

  /**
   * Get occurrence details for an item
   */
  getOccurrenceDetails(item, parsedItems) {
    const occurrences = [];
    parsedItems.forEach((parsedItem, index) => {
      if (parsedItem === item) {
        occurrences.push(`Position ${index + 1}`);
      }
    });
    return occurrences.length > 0
      ? `Found at: ${occurrences.join(", ")}`
      : "Not found";
  }

  /**
   * Re-analyze the text
   */
  reanalyze() {
    this.closeVerification();
    this.analyzeText();
    this.showNotification("Text re-analyzed", "success");
  }

  /**
   * Export verification data
   */
  async exportVerification() {
    if (this.currentData.items.length === 0) {
      this.showNotification("No verification data to export", "warning");
      return;
    }

    try {
      const originalItems = this.originalText
        .split(/[\s\n\r]+/)
        .filter((item) => item.trim().length > 0);
      const parsedItems = this.currentData.items;
      const frequency = this.currentData.frequency;
      const sortedFrequency = this.sortFrequency(frequency);

      let verificationData = "VERIFICATION REPORT\n";
      verificationData += "==================\n\n";
      verificationData += `Original Items Count: ${originalItems.length}\n`;
      verificationData += `Parsed Items Count: ${parsedItems.length}\n`;
      verificationData += `Verification Status: ${
        originalItems.length === parsedItems.length ? "PASSED" : "FAILED"
      }\n\n`;

      verificationData += "FREQUENCY ANALYSIS:\n";
      verificationData += "Item\tAlgorithm Count\tManual Count\tStatus\n";
      verificationData += "----\t---------------\t-------------\t------\n";

      sortedFrequency.forEach((count, item) => {
        const manualCount = parsedItems.filter(
          (parsedItem) => parsedItem === item
        ).length;
        const status = count === manualCount ? "PASS" : "FAIL";
        verificationData += `${item}\t${count}\t${manualCount}\t${status}\n`;
      });

      verificationData += "\nRAW DATA:\n";
      verificationData += "Original Items:\n";
      originalItems.forEach((item, index) => {
        verificationData += `${index + 1}. "${item}"\n`;
      });

      verificationData += "\nParsed Items:\n";
      parsedItems.forEach((item, index) => {
        verificationData += `${index + 1}. "${item}"\n`;
      });

      await navigator.clipboard.writeText(verificationData);
      this.showNotification(
        "Verification data copied to clipboard!",
        "success"
      );
    } catch (error) {
      console.error("Failed to export verification data:", error);
      this.showNotification("Failed to export verification data", "error");
    }
  }
}
