import {
  createVerification,
  getVerificationById,
  getVerificationsByWallet,
  updateVerificationWithProof,
} from "../repositories/mongodb/actions/kyc.js";
import crypto from "crypto";
// import { Onfido } from "onfido-sdk-ui";

// const onfido = Onfido.init({
//   apiToken: process.env.ONFIDO_API_TOKEN,
//   region: process.env.ONFIDO_REGION || "EU",
// });

const initVerification = async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        message: "email, firstName, lastName are required",
      });
    }

    // // Create an Onfido applicant
    // const applicant = await onfido.applicant.create({
    //   email,
    //   first_name: firstName,
    //   last_name: lastName,
    // });

    // // Generate an SDK token for the applicant
    // const sdkToken = await onfido.sdkToken.generate({
    //   applicant_id: applicant.id,
    //   referrer: process.env.ONFIDO_REFERRER || "*", // Adjust referrer as needed
    // });

    // // Create a workflow run (assumes a specific workflow ID is configured)
    // const workflowRun = await onfido.workflowRun.create({
    //   applicant_id: applicant.id,
    //   workflow_id: process.env.ONFIDO_WORKFLOW_ID, // Set your workflow ID in env
    // });

    // Temporary placeholders for Onfido data (replace with actual values once Onfido is set up)
    const dummySdkToken =
      "dummy-sdk-token-" + crypto.randomBytes(16).toString("hex");
    const dummyWorkflowRunId =
      "dummy-workflow-run-" + crypto.randomBytes(16).toString("hex");

    // Store verification details in the database
    const verificationId = crypto.randomBytes(16).toString("hex");
    await createVerification({
      verificationId,
      status: "PENDING", // Matches schema default
      proof: null, // Matches schema default
    });

    // Return the required data for the frontend
    res.status(201).json({
      success: true,
      verificationId,
      sdkToken: dummySdkToken,
      workflowRunId: dummyWorkflowRunId,
    });
  } catch (error) {
    console.error("Error initializing verification:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to initialize verification" });
  }
};

// const initVerification = async (req, res) => {
//   try {
//     const { walletAddress } = req.body;
//     if (!walletAddress) {
//       return res.status(400).json({ message: "walletAddress is required" });
//     }

//     const verificationId = crypto.randomBytes(16).toString("hex");
//     const newVerification = await createVerification({
//       verificationId,
//       walletAddress,
//     });
//     res.status(201).json({ success: true, verificationId });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const getVerificationStatus = async (req, res) => {
  try {
    const { verificationId } = req.params;
    if (!verificationId) {
      return res.status(400).json({ message: "verificationId is required" });
    }

    const verification = await getVerificationById(verificationId);
    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }

    res.status(200).json({ success: true, status: verification.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserVerifications = async (req, res) => {
  try {
    const verifications = await getVerificationsByWallet(
      req.user.walletAddress
    );
    res.status(200).json({ success: true, verifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserVerificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const verification = await getVerificationById(id);
    res.status(200).json({ success: true, verification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateProof = async (req, res) => {
  try {
    const { verificationId } = req.params;
    if (!verificationId) {
      return res.status(400).json({ message: "verificationId is required" });
    }

    const verification = await getVerificationById(verificationId);
    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }

    if (verification.status !== "VERIFIED") {
      return res
        .status(400)
        .json({ message: "Verification must be VERIFIED first" });
    }

    const proof = crypto.randomBytes(32).toString("hex");
    const updatedVerification = await updateVerificationWithProof(
      verificationId,
      proof
    );
    res.status(200).json({ success: true, proof });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  initVerification,
  getVerificationStatus,
  getUserVerifications,
  getUserVerificationById,
  generateProof,
};
