// onfidoService.js

class OnfidoService {
  constructor() {
    this.onfido = null;
    this.containerId = "onfido-mount";
  }

  /**
   * Initialize the Onfido SDK
   * @param {string} sdkToken - The SDK token from your backend
   * @param {string} workflowRunId - The workflow run ID from your backend
   * @param {Object} options - Additional options
   */
  initialize(sdkToken, workflowRunId, options = {}) {
    if (!sdkToken) {
      throw new Error("SDK token is required to initialize Onfido");
    }

    if (!workflowRunId) {
      throw new Error("Workflow run ID is required for verification");
    }

    // Ensure Onfido is available globally
    if (typeof window === "undefined" || !window.Onfido) {
      console.error(
        "Onfido SDK not loaded in window. Check your script tag in HTML."
      );
      throw new Error(
        "Onfido SDK not available. Make sure the CDN script is included in your HTML."
      );
    }

    // Get container ID from options or use default
    const containerId = options.containerId || this.containerId;

    // Check if the mount element exists immediately
    const mountElement = document.getElementById(containerId);
    if (!mountElement) {
      console.error(
        `Element ID ${containerId} does not exist in current page body`
      );
      throw new Error(`Element ID ${containerId} does not exist`);
    }

    // Default configuration for workflow-based verification
    const defaultOptions = {
      token: sdkToken,
      containerId: containerId,
      workflowRunId: workflowRunId,
      steps: ["welcome", "document", "face"],
      onComplete: (data) => {
        console.log("Onfido verification completed:", data);
        if (options.onComplete) {
          options.onComplete(data);
        }
      },
      onError: (error) => {
        console.error("Onfido error:", error);
        if (options.onError) {
          options.onError(error);
        }
      },
    };

    // Merge default options with passed options
    const mergedOptions = { ...defaultOptions, ...options };

    try {
      console.log("Initializing Onfido SDK with options:", {
        containerId: mergedOptions.containerId,
        workflowRunId: mergedOptions.workflowRunId,
        steps: mergedOptions.steps,
      });

      // Initialize the Onfido SDK with workflow
      this.onfido = window.Onfido.init({
        ...mergedOptions,
        workflow: {
          workflowRunId: workflowRunId,
          token: sdkToken,
        },
      });

      return this;
    } catch (error) {
      console.error("Error initializing Onfido SDK:", error);
      throw error;
    }
  }

  start() {
    if (!this.onfido) {
      throw new Error("Onfido SDK not initialized");
    }

    try {
      this.onfido.setOptions({
        isModalOpen: true,
        shouldCloseOnOverlayClick: false,
      });
    } catch (error) {
      console.error("Error starting Onfido SDK:", error);
      throw error;
    }
  }

  tearDown() {
    if (this.onfido) {
      try {
        this.onfido.tearDown();
        this.onfido = null;
        console.log("Onfido SDK torn down successfully");
      } catch (error) {
        console.error("Error tearing down Onfido SDK:", error);
      }
    }
  }
}

export default new OnfidoService();
