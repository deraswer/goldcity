import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import onfidoService from "../../services/onfidoService";
import { useInitVerificationMutation } from "../../features/kyc/kycApiSlice";

// Error Boundary (unchanged)
const withErrorBoundary = (WrappedComponent) => {
  return class extends React.Component {
    state = { hasError: false, errorMessage: null };

    static getDerivedStateFromError(error) {
      return { hasError: true, errorMessage: error.message };
    }

    componentDidCatch(error, info) {
      console.error("SDK Error Boundary caught error:", error, info);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="dark-card glass-effect">
            <h3 className="text-red-400 font-medium mb-2">SDK Loading Error</h3>
            <p className="text-gray-300 mb-4">
              {this.state.errorMessage || "Failed to load SDK"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="dark-button"
            >
              Refresh Page
            </button>
          </div>
        );
      }
      return <WrappedComponent {...this.props} />;
    }
  };
};

const OnfidoVerificationPage = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationData, setVerificationData] = useState(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user) || {};
  const containerRef = useRef(null);
  const sdkInitializedRef = useRef(false);
  const verificationInitialized = useRef(false);
  const maxRetries = 3;
  const retryDelayMs = 1000;
  const containerCheckRetries = 5;
  const containerCheckInterval = 200;

  // RTK Query mutation hook
  const [
    initVerification,
    { isLoading: mutationLoading, error: mutationError },
  ] = useInitVerificationMutation();

  // Effect to load Onfido SDK script
  useEffect(() => {
    let retryCount = 0;
    let scriptElement = null;

    const loadSDK = async () => {
      if (window.Onfido) {
        console.log("Onfido SDK already loaded");
        setSdkLoaded(true);
        return;
      }

      if (retryCount >= maxRetries) {
        console.error(`Failed to load Onfido SDK after ${maxRetries} attempts`);
        setError("Failed to load verification SDK. Please refresh the page.");
        setIsLoading(false);
        return;
      }

      console.log(
        `Loading Onfido SDK (attempt ${retryCount + 1}/${maxRetries})`
      );

      // Remove existing script/style elements
      const existingScript = document.querySelector('script[src*="onfido"]');
      const existingStyle = document.querySelector('link[href*="onfido"]');
      if (existingScript) existingScript.remove();
      if (existingStyle) existingStyle.remove();

      // Create script element
      scriptElement = document.createElement("script");
      scriptElement.src = "https://sdk.onfido.com/v14.43.0";
      scriptElement.crossOrigin = "anonymous";
      scriptElement.async = true;
      scriptElement.type = "text/javascript";
      scriptElement.charset = "utf-8";

      scriptElement.onload = () => {
        console.log("Onfido SDK loaded successfully");
        setSdkLoaded(true);
      };

      scriptElement.onerror = () => {
        console.error(
          `Failed to load Onfido SDK (attempt ${retryCount + 1}/${maxRetries})`
        );
        if (retryCount < maxRetries - 1) {
          retryCount++;
          setTimeout(loadSDK, retryDelayMs);
        } else {
          setError("Failed to load verification SDK. Please refresh the page.");
          setIsLoading(false);
        }
      };

      document.head.appendChild(scriptElement);
    };

    loadSDK();

    return () => {
      if (scriptElement) scriptElement.remove();
      if (sdkInitializedRef.current) {
        onfidoService.tearDown();
        sdkInitializedRef.current = false;
      }
    };
  }, []);

  // Effect to initialize verification
  useEffect(() => {
    const checkContainerAndInitialize = async (attempt = 1) => {
      const containerExists =
        containerRef.current || document.getElementById("onfido-mount");
      console.log(
        `Initialization check (attempt ${attempt}/${containerCheckRetries}): `,
        `sdkLoaded=${sdkLoaded}, containerExists=${!!containerExists}, verificationInitialized=${
          verificationInitialized.current
        }`
      );

      if (!sdkLoaded || !containerExists || verificationInitialized.current) {
        if (!containerExists && attempt < containerCheckRetries) {
          console.log(
            `Container not found, retrying (${attempt}/${containerCheckRetries})`
          );
          setTimeout(
            () => checkContainerAndInitialize(attempt + 1),
            containerCheckInterval
          );
        } else if (!containerExists) {
          console.error("Container element not found after retries");
          setError("Failed to initialize: Container element not found.");
          setIsLoading(false);
        }
        return;
      }

      verificationInitialized.current = true;
      console.log("Initializing verification with SDK and container ready");

      try {
        setIsLoading(true);

        // Use RTK Query mutation instead of fetch
        const response = await initVerification({
          firstName: user?.firstName || "Test",
          lastName: user?.lastName || "User",
          email: user?.email || "test@example.com",
        }).unwrap();

        console.log("Verification data received:", response);

        if (!response.sdkToken || !response.workflowRunId) {
          throw new Error(
            "Invalid response from server: missing required data"
          );
        }

        setVerificationData(response);

        // Initialize Onfido SDK
        try {
          sdkInitializedRef.current = true;
          onfidoService.initialize(response.sdkToken, response.workflowRunId, {
            containerId: "onfido-mount",
            onComplete: (data) => {
              console.log("Verification completed:", data);
              navigate("/profile/kyc", {
                state: {
                  verificationComplete: true,
                  applicantId: data.applicantId,
                },
              });
            },
            onError: (error) => {
              console.error("Verification error:", error);
              setError(error.message || "Error during verification process");
              sdkInitializedRef.current = false;
              setIsLoading(false);
            },
          });
          console.log("Onfido SDK initialized successfully");
        } catch (error) {
          console.error("SDK initialization error:", error);
          setError(error.message || "Failed to initialize SDK");
          sdkInitializedRef.current = false;
        }
      } catch (error) {
        console.error("Verification initialization error:", error);
        setError(
          mutationError?.data?.message ||
            error.message ||
            "Failed to initialize verification"
        );
      } finally {
        setIsLoading(false);
      }
    };

    // Start initialization with retries
    checkContainerAndInitialize();

    return () => {};
  }, [sdkLoaded, user, navigate, initVerification, mutationError]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="glass-effect max-w-md w-full p-8 rounded-xl">
          <h2 className="text-[var(--text-primary)] text-xl font-semibold mb-4">
            Verification Error
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">{error}</p>
          <button
            onClick={() => navigate("/profile/kyc")}
            className="dark-button w-full"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center p-6">
      {isLoading && (
        <div className="absolute flex flex-col items-center justify-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-[var(--text-secondary)]">
            {!sdkLoaded
              ? "Loading verification SDK..."
              : mutationLoading
              ? "Initializing verification..."
              : "Loading verification..."}
          </p>
        </div>
      )}
      <div
        id="onfido-mount"
        ref={containerRef}
        className="w-full max-w-4xl glass-effect"
        style={{
          minHeight: "600px",
          background: "var(--background-secondary)",
          borderRadius: "1rem",
          overflow: "hidden",
        }}
      />
    </div>
  );
};

export default withErrorBoundary(OnfidoVerificationPage);
