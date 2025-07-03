import redis from "redis";

let redisClient;

const connectRedis = async (url) => {
  try {
    redisClient = redis.createClient({
      url: url || "redis://localhost:6379",
    });

    redisClient.on("error", (err) => console.log("Redis Client Error", err));

    await redisClient.connect();
    console.log("Redis client connected");
    return redisClient;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    throw error;
  }
};

export { connectRedis, redisClient };
