/**
 * Base Module Class
 * Provides the foundation for all functional modules
 */
export class Module {
  constructor(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.isActive = false;
    this.container = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize the module
   * Override this method in child classes
   */
  init() {
    throw new Error("init() method must be implemented by child class");
  }

  /**
   * Activate the module
   */
  activate() {
    this.isActive = true;
    this.onActivate();
  }

  /**
   * Deactivate the module
   */
  deactivate() {
    this.isActive = false;
    this.onDeactivate();
  }

  /**
   * Called when module is activated
   * Override in child classes
   */
  onActivate() {
    // Override in child classes
  }

  /**
   * Called when module is deactivated
   * Override in child classes
   */
  onDeactivate() {
    // Override in child classes
  }

  /**
   * Render the module's HTML
   * Override in child classes
   */
  render() {
    throw new Error("render() method must be implemented by child class");
  }

  /**
   * Clean up resources
   * Override in child classes
   */
  destroy() {
    this.removeAllEventListeners();
    this.onDeactivate();
  }

  /**
   * Add event listener with automatic cleanup
   */
  addEventListener(element, event, handler) {
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }

    element.addEventListener(event, handler);
    this.eventListeners.get(element).push({ event, handler });
  }

  /**
   * Remove all event listeners
   */
  removeAllEventListeners() {
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    this.eventListeners.clear();
  }

  /**
   * Show notification
   */
  showNotification(message, type = "info") {
    // Remove existing notification
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Show with animation
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
