import { redisClient } from "../connect.js";

const CHALLENGE_TTL = 300; // TTL in seconds (5 minutes)

const setChallenge = async (key, challenge) => {
  try {
    await redisClient.setEx(key, CHALLENGE_TTL, challenge);
    return true;
  } catch (error) {
    console.error("Error setting challenge in Redis:", error);
    return false;
  }
};

const getChallengeByKey = async (key) => {
  try {
    const challenge = await redisClient.get(key);
    return challenge || null;
  } catch (error) {
    console.error("Error getting challenge from Redis:", error);
    return null;
  }
};

const deleteChallengeByKey = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("Error deleting challenge from Redis:", error);
    return false;
  }
};

export { setChallenge, getChallengeByKey, deleteChallengeByKey };
