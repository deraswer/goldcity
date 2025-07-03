import Identity from "../models/identity.js";

const createIdentity = async (walletAddress, name, email, description) => {
  const newIdentity = await Identity.create({
    walletAddress,
    name,
    email,
    description,
  });

  if (!newIdentity) {
    throw new Error("Identity not created");
  }

  return {
    success: true,
    did: newIdentity._id.toString(),
    sbtTokenId: `SBT-${newIdentity._id.toString().slice(-6)}`,
    didDocument: {
      id: newIdentity._id.toString(),
      walletAddress: newIdentity.walletAddress,
      name: newIdentity.name,
      email: newIdentity.email,
      description: newIdentity.description,
      createdAt: newIdentity.createdAt,
    },
  };
};

const getIdentityById = async (id) => {
  const identity = await Identity.findOne({ _id: id }).populate("creator");

  if (!identity) {
    throw new Error("Identity not found");
  }

  return {
    success: true,
    did: identity._id.toString(),
    sbtTokenId: `SBT-${identity._id.toString().slice(-6)}`,
    didDocument: {
      id: identity._id.toString(),
      walletAddress: identity.walletAddress,
      name: identity.name,
      email: identity.email,
      description: identity.description,
      createdAt: identity.createdAt,
    },
  };
};

const getIdentityByWalletAddress = async (walletAddress) => {
  return await Identity.findOne({ walletAddress }).populate("creator");
};

export { createIdentity, getIdentityById, getIdentityByWalletAddress };
