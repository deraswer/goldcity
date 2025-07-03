import mongoose from "mongoose";

const credentialSchema = new mongoose.Schema({
  did: { type: String, required: true },
  credentialHash: { type: String, required: true, unique: true },
  credentialType: { type: String, required: true },
  issuerDid: { type: String, required: true },
  issuanceDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["ACTIVE", "REVOKED"], default: "ACTIVE" },
  metadata: { type: Object, default: {} },
});

const Credential = mongoose.model("Credential", credentialSchema);

export default Credential;
