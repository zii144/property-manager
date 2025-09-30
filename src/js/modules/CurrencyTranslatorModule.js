import { Module } from "../core/Module.js";

/**
 * Currency Translator Module
 * Convert between different currencies with real-time exchange rates
 */
export class CurrencyTranslatorModule extends Module {
  constructor() {
    super(
      "currency-translator",
      "Currency Translator",
      "Convert between different currencies with real-time exchange rates"
    );
    this.icon = "💱";
    this.exchangeRates = new Map();
    this.lastUpdated = null;
    this.isLoading = false;
  }

  /**
   * Initialize the module
   */
  init() {
    this.setupEventListeners();
    this.loadExchangeRates();
  }

  /**
   * Render the module's HTML
   */
  render() {
    const container = document.createElement("div");
    container.className = "module-content";
    container.innerHTML = `
      <div class="currency-converter">
        <div class="converter-header">
          <h2 class="converter-title">Currency Converter</h2>
          <div class="rate-info">
            <span id="lastUpdated" class="last-updated">Loading rates...</span>
            <button id="refreshRatesBtn" class="btn btn-refresh" title="Refresh exchange rates">
              <svg class="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4a9 9 0 0 1-14.85 4.36L23 14"></path>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <div class="converter-form">
          <div class="amount-section">
            <label for="amountInput" class="input-label">Amount</label>
            <div class="amount-input-group">
              <span class="currency-symbol" id="fromSymbol">$</span>
              <input 
                type="number" 
                id="amountInput" 
                class="amount-input" 
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div class="currency-selection">
            <div class="from-currency">
              <label for="fromCurrency" class="input-label">From</label>
              <select id="fromCurrency" class="currency-select">
                <option value="USD">🇺🇸 USD - US Dollar</option>
                <option value="EUR">🇪🇺 EUR - Euro</option>
                <option value="GBP">🇬🇧 GBP - British Pound</option>
                <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
                <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
                <option value="CHF">🇨🇭 CHF - Swiss Franc</option>
                <option value="CNY">🇨🇳 CNY - Chinese Yuan</option>
                <option value="INR">🇮🇳 INR - Indian Rupee</option>
                <option value="BRL">🇧🇷 BRL - Brazilian Real</option>
              </select>
            </div>

            <div class="swap-button-container">
              <button id="swapCurrenciesBtn" class="btn btn-swap" title="Swap currencies">
                <svg class="swap-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 3h5v5"></path>
                  <path d="M8 21H3v-5"></path>
                  <path d="M21 3l-7 7-4-4"></path>
                  <path d="M3 21l7-7 4 4"></path>
                </svg>
              </button>
            </div>

            <div class="to-currency">
              <label for="toCurrency" class="input-label">To</label>
              <select id="toCurrency" class="currency-select">
                <option value="EUR">🇪🇺 EUR - Euro</option>
                <option value="USD">🇺🇸 USD - US Dollar</option>
                <option value="GBP">🇬🇧 GBP - British Pound</option>
                <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
                <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
                <option value="CHF">🇨🇭 CHF - Swiss Franc</option>
                <option value="CNY">🇨🇳 CNY - Chinese Yuan</option>
                <option value="INR">🇮🇳 INR - Indian Rupee</option>
                <option value="BRL">🇧🇷 BRL - Brazilian Real</option>
              </select>
            </div>
          </div>

          <div class="conversion-actions">
            <button id="convertBtn" class="btn btn-primary">Convert</button>
            <button id="clearBtn" class="btn btn-secondary">Clear</button>
          </div>
        </div>

        <div class="conversion-result" id="conversionResult" style="display: none;">
          <div class="result-header">
            <h3>Conversion Result</h3>
            <button id="copyResultBtn" class="btn btn-copy" title="Copy result">
              <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </button>
          </div>
          <div class="result-content">
            <div class="conversion-amount" id="conversionAmount">0.00</div>
            <div class="conversion-details" id="conversionDetails"></div>
            <div class="exchange-rate" id="exchangeRate"></div>
          </div>
        </div>

        <div class="popular-conversions" id="popularConversions">
          <h4>Popular Conversions</h4>
          <div class="conversion-grid" id="conversionGrid">
            <!-- Popular conversions will be populated here -->
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
    const amountInput = document.getElementById("amountInput");
    const fromCurrency = document.getElementById("fromCurrency");
    const toCurrency = document.getElementById("toCurrency");
    const convertBtn = document.getElementById("convertBtn");
    const clearBtn = document.getElementById("clearBtn");
    const swapBtn = document.getElementById("swapCurrenciesBtn");
    const refreshBtn = document.getElementById("refreshRatesBtn");
    const copyResultBtn = document.getElementById("copyResultBtn");

    if (convertBtn) {
      this.addEventListener(convertBtn, "click", () => this.convert());
    }
    if (clearBtn) {
      this.addEventListener(clearBtn, "click", () => this.clear());
    }
    if (swapBtn) {
      this.addEventListener(swapBtn, "click", () => this.swapCurrencies());
    }
    if (refreshBtn) {
      this.addEventListener(refreshBtn, "click", () =>
        this.loadExchangeRates(true)
      );
    }
    if (copyResultBtn) {
      this.addEventListener(copyResultBtn, "click", () => this.copyResult());
    }

    // Auto-convert on input change
    if (amountInput) {
      this.addEventListener(amountInput, "input", () => {
        if (amountInput.value && !isNaN(amountInput.value)) {
          this.convert();
        }
      });
    }

    // Auto-convert on currency change
    if (fromCurrency) {
      this.addEventListener(fromCurrency, "change", () => {
        this.updateCurrencySymbol();
        if (amountInput && amountInput.value) {
          this.convert();
        }
      });
    }

    if (toCurrency) {
      this.addEventListener(toCurrency, "change", () => {
        if (amountInput && amountInput.value) {
          this.convert();
        }
      });
    }

    // Handle Enter key
    if (amountInput) {
      this.addEventListener(amountInput, "keydown", (e) => {
        if (e.key === "Enter") {
          this.convert();
        }
      });
    }
  }

  /**
   * Load exchange rates from API
   */
  async loadExchangeRates(showNotification = false) {
    if (this.isLoading) return;

    this.isLoading = true;
    const refreshBtn = document.getElementById("refreshRatesBtn");
    const lastUpdated = document.getElementById("lastUpdated");

    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = `
        <svg class="refresh-icon spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4a9 9 0 0 1-14.85 4.36L23 14"></path>
        </svg>
        Loading...
      `;
    }

    try {
      // Using a free exchange rate API
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.exchangeRates = new Map(Object.entries(data.rates));
      this.lastUpdated = new Date();

      if (lastUpdated) {
        lastUpdated.textContent = `Rates updated: ${this.lastUpdated.toLocaleTimeString()}`;
        lastUpdated.className = "last-updated success";
      }

      this.populatePopularConversions();
      if (showNotification) {
        this.showNotification(
          "Exchange rates updated successfully!",
          "success"
        );
      }
    } catch (error) {
      console.error("Failed to load exchange rates:", error);
      this.showNotification(
        "Failed to load exchange rates. Using fallback rates.",
        "warning"
      );

      // Fallback rates (approximate)
      this.loadFallbackRates();

      if (lastUpdated) {
        lastUpdated.textContent = "Using fallback rates";
        lastUpdated.className = "last-updated warning";
      }
    } finally {
      this.isLoading = false;
      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = `
          <svg class="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4a9 9 0 0 1-14.85 4.36L23 14"></path>
          </svg>
          Refresh
        `;
      }
    }
  }

  /**
   * Load fallback exchange rates
   */
  loadFallbackRates() {
    const fallbackRates = {
      USD: 1.0,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.0,
      CAD: 1.25,
      AUD: 1.35,
      CHF: 0.92,
      CNY: 6.45,
      INR: 74.0,
      BRL: 5.2,
    };
    this.exchangeRates = new Map(Object.entries(fallbackRates));
    this.lastUpdated = new Date();
  }

  /**
   * Convert currency
   */
  convert() {
    const amountInput = document.getElementById("amountInput");
    const fromCurrency = document.getElementById("fromCurrency");
    const toCurrency = document.getElementById("toCurrency");

    if (!amountInput || !fromCurrency || !toCurrency) return;

    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (isNaN(amount) || amount <= 0) {
      this.showNotification("Please enter a valid amount", "warning");
      return;
    }

    if (from === to) {
      this.showNotification("Please select different currencies", "warning");
      return;
    }

    if (this.exchangeRates.size === 0) {
      this.showNotification(
        "Exchange rates not loaded. Please refresh.",
        "warning"
      );
      return;
    }

    try {
      const result = this.calculateConversion(amount, from, to);
      this.displayResult(amount, from, to, result);
    } catch (error) {
      console.error("Conversion error:", error);
      this.showNotification("Conversion failed. Please try again.", "error");
    }
  }

  /**
   * Calculate currency conversion
   */
  calculateConversion(amount, from, to) {
    // Convert to USD first, then to target currency
    const fromRate = this.exchangeRates.get(from);
    const toRate = this.exchangeRates.get(to);

    if (!fromRate || !toRate) {
      throw new Error("Exchange rate not available");
    }

    // Convert to USD
    const usdAmount = amount / fromRate;
    // Convert from USD to target currency
    const result = usdAmount * toRate;

    return {
      amount: result,
      rate: toRate / fromRate,
    };
  }

  /**
   * Display conversion result
   */
  displayResult(originalAmount, from, to, result) {
    const conversionResult = document.getElementById("conversionResult");
    const conversionAmount = document.getElementById("conversionAmount");
    const conversionDetails = document.getElementById("conversionDetails");
    const exchangeRate = document.getElementById("exchangeRate");

    if (
      !conversionResult ||
      !conversionAmount ||
      !conversionDetails ||
      !exchangeRate
    )
      return;

    const formattedAmount = this.formatCurrency(result.amount, to);
    const formattedOriginal = this.formatCurrency(originalAmount, from);

    conversionAmount.textContent = formattedAmount;
    conversionDetails.textContent = `${formattedOriginal} = ${formattedAmount}`;
    exchangeRate.textContent = `1 ${from} = ${this.formatCurrency(
      result.rate,
      to
    )}`;

    conversionResult.style.display = "block";
    conversionResult.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount, currency) {
    const currencySymbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      CHF: "CHF",
      CNY: "¥",
      INR: "₹",
      BRL: "R$",
    };

    const symbol = currencySymbols[currency] || currency;
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${symbol}${formatted}`;
  }

  /**
   * Update currency symbol
   */
  updateCurrencySymbol() {
    const fromCurrency = document.getElementById("fromCurrency");
    const fromSymbol = document.getElementById("fromSymbol");

    if (fromCurrency && fromSymbol) {
      const currencySymbols = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        JPY: "¥",
        CAD: "C$",
        AUD: "A$",
        CHF: "CHF",
        CNY: "¥",
        INR: "₹",
        BRL: "R$",
      };

      const symbol = currencySymbols[fromCurrency.value] || fromCurrency.value;
      fromSymbol.textContent = symbol;
    }
  }

  /**
   * Swap currencies
   */
  swapCurrencies() {
    const fromCurrency = document.getElementById("fromCurrency");
    const toCurrency = document.getElementById("toCurrency");

    if (fromCurrency && toCurrency) {
      const temp = fromCurrency.value;
      fromCurrency.value = toCurrency.value;
      toCurrency.value = temp;

      this.updateCurrencySymbol();
      this.convert();
    }
  }

  /**
   * Clear all inputs
   */
  clear() {
    const amountInput = document.getElementById("amountInput");
    const conversionResult = document.getElementById("conversionResult");

    if (amountInput) {
      amountInput.value = "";
      amountInput.focus();
    }

    if (conversionResult) {
      conversionResult.style.display = "none";
    }
  }

  /**
   * Copy result to clipboard
   */
  async copyResult() {
    const conversionDetails = document.getElementById("conversionDetails");
    const exchangeRate = document.getElementById("exchangeRate");

    if (!conversionDetails || !exchangeRate) return;

    const resultText = `${conversionDetails.textContent}\n${exchangeRate.textContent}`;

    try {
      await navigator.clipboard.writeText(resultText);
      this.showNotification("Result copied to clipboard!", "success");
    } catch (error) {
      console.error("Failed to copy result:", error);
      this.showNotification("Failed to copy result", "error");
    }
  }

  /**
   * Populate popular conversions
   */
  populatePopularConversions() {
    const conversionGrid = document.getElementById("conversionGrid");
    if (!conversionGrid || this.exchangeRates.size === 0) return;

    const popularPairs = [
      { from: "USD", to: "EUR" },
      { from: "USD", to: "GBP" },
      { from: "USD", to: "JPY" },
      { from: "EUR", to: "GBP" },
      { from: "USD", to: "CAD" },
      { from: "USD", to: "AUD" },
    ];

    let html = "";
    popularPairs.forEach((pair) => {
      try {
        const result = this.calculateConversion(1, pair.from, pair.to);
        const formatted = this.formatCurrency(result.amount, pair.to);
        html += `
          <div class="conversion-item" data-from="${pair.from}" data-to="${pair.to}">
            <div class="conversion-pair">${pair.from} → ${pair.to}</div>
            <div class="conversion-rate">1 ${pair.from} = ${formatted}</div>
          </div>
        `;
      } catch (error) {
        console.warn(`Failed to calculate ${pair.from} to ${pair.to}:`, error);
      }
    });

    conversionGrid.innerHTML = html;

    // Add click handlers to popular conversions
    conversionGrid.querySelectorAll(".conversion-item").forEach((item) => {
      this.addEventListener(item, "click", () => {
        const from = item.dataset.from;
        const to = item.dataset.to;
        const fromSelect = document.getElementById("fromCurrency");
        const toSelect = document.getElementById("toCurrency");

        if (fromSelect && toSelect) {
          fromSelect.value = from;
          toSelect.value = to;
          this.updateCurrencySymbol();
        }
      });
    });
  }
}
