/**
 * Module Manager
 * Handles registration, activation, and management of all modules
 */
export class ModuleManager {
  constructor() {
    this.modules = new Map();
    this.activeModule = null;
    this.container = null;
    this.tabContainer = null;
  }

  /**
   * Initialize the module manager
   */
  init(container, tabContainer) {
    this.container = container;
    this.tabContainer = tabContainer;
    this.setupTabNavigation();
  }

  /**
   * Register a module
   */
  registerModule(module) {
    if (this.modules.has(module.id)) {
      console.warn(`Module with id '${module.id}' is already registered`);
      return;
    }

    this.modules.set(module.id, module);
    this.addTab(module);
  }

  /**
   * Activate a module by ID
   */
  activateModule(moduleId) {
    if (!this.modules.has(moduleId)) {
      console.error(`Module with id '${moduleId}' not found`);
      return;
    }

    // Deactivate current module
    if (this.activeModule) {
      this.activeModule.deactivate();
    }

    // Activate new module
    const module = this.modules.get(moduleId);
    this.activeModule = module;
    module.activate();

    // Update UI
    this.updateActiveTab(moduleId);
    this.renderActiveModule();
  }

  /**
   * Get all registered modules
   */
  getModules() {
    return Array.from(this.modules.values());
  }

  /**
   * Get active module
   */
  getActiveModule() {
    return this.activeModule;
  }

  /**
   * Setup tab navigation
   */
  setupTabNavigation() {
    this.tabContainer.innerHTML = `
      <nav class="tab-navigation">
        <div class="tab-list" id="tabList"></div>
      </nav>
    `;
  }

  /**
   * Add tab for a module
   */
  addTab(module) {
    const tabList = document.getElementById("tabList");
    if (!tabList) return;

    const tab = document.createElement("button");
    tab.className = "tab-button";
    tab.dataset.moduleId = module.id;
    tab.innerHTML = `
      <span class="tab-icon">${module.icon || "📊"}</span>
      <span class="tab-name">${module.name}</span>
    `;

    // Add click event
    this.addEventListener(tab, "click", () => {
      this.activateModule(module.id);
    });

    tabList.appendChild(tab);
  }

  /**
   * Update active tab styling
   */
  updateActiveTab(moduleId) {
    const tabs = this.tabContainer.querySelectorAll(".tab-button");
    tabs.forEach((tab) => {
      if (tab.dataset.moduleId === moduleId) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });
  }

  /**
   * Render the active module
   */
  renderActiveModule() {
    if (!this.activeModule || !this.container) return;

    this.container.innerHTML = "";
    this.container.appendChild(this.activeModule.render());

    // Initialize the module after rendering
    this.activeModule.init();
  }

  /**
   * Add event listener with cleanup tracking
   */
  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
  }

  /**
   * Clean up all modules
   */
  destroy() {
    this.modules.forEach((module) => {
      module.destroy();
    });
    this.modules.clear();
    this.activeModule = null;
  }
}
