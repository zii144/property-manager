/**
 * Text Analysis Tools Application
 * Modular architecture with tabbed interface
 */

import { ModuleManager } from "./core/ModuleManager.js";
import { TextFrequencyModule } from "./modules/TextFrequencyModule.js";
import { CurrencyTranslatorModule } from "./modules/CurrencyTranslatorModule.js";
import { JsonToExcelModule } from "./modules/JsonToExcelModule.js";
import { DataMappingModule } from "./modules/DataMappingModule.js";
import { SignalSurveyModule } from "./modules/SignalSurveyModule.js";

class TextAnalysisApp {
  constructor() {
    this.moduleManager = new ModuleManager();
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setupApp());
    } else {
      this.setupApp();
    }
  }

  /**
   * Setup the application
   */
  setupApp() {
    const moduleContainer = document.getElementById("moduleContainer");
    const tabContainer = document.getElementById("tabContainer");

    if (!moduleContainer || !tabContainer) {
      console.error("Required containers not found");
      return;
    }

    // Initialize module manager
    this.moduleManager.init(moduleContainer, tabContainer);

    // Register modules
    this.registerModules();

    // Activate the first module by default
    const modules = this.moduleManager.getModules();
    if (modules.length > 0) {
      this.moduleManager.activateModule(modules[0].id);
    }
  }

  /**
   * Register all available modules
   */
  registerModules() {
    // Register Text Frequency Counter module
    const textFrequencyModule = new TextFrequencyModule();
    this.moduleManager.registerModule(textFrequencyModule);

    // Register Currency Translator module
    const currencyTranslatorModule = new CurrencyTranslatorModule();
    this.moduleManager.registerModule(currencyTranslatorModule);

    // Register JSON to Excel module
    const jsonToExcelModule = new JsonToExcelModule();
    this.moduleManager.registerModule(jsonToExcelModule);

    // Register Data Mapping module
    const dataMappingModule = new DataMappingModule();
    this.moduleManager.registerModule(dataMappingModule);

    // Register Signal Survey module
    const signalSurveyModule = new SignalSurveyModule();
    this.moduleManager.registerModule(signalSurveyModule);

    // Future modules can be registered here
    // const wordCloudModule = new WordCloudModule();
    // this.moduleManager.registerModule(wordCloudModule);
  }
}

// Initialize the application
new TextAnalysisApp();
