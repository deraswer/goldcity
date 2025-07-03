import {
  createIdentity,
  getIdentityById,
} from "../repositories/mongodb/actions/identity.js";

const createDID = async (req, res) => {
  try {
    const { walletAddress, metadata } = req.body;
    const { name, email, description } = metadata;

    if (!walletAddress || !name || !email) {
      return res.status(400).json({
        message: "walletAddress, name, and email are required",
      });
    }

    const response = await createIdentity(
      walletAddress,
      name,
      email,
      description
    );

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDIDByID = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await getIdentityById(id);
    res.status(200).json(response);
  } catch (error) {
    if (error.message === "Identity not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

export { createDID, getDIDByID };
