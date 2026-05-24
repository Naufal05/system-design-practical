// server.js
const express = require("express");
const { createClient } = require("redis");

const app = express();
const PORT = 3000;

// Initialize Redis Client
const redisClient = createClient({
  url: "redis://cache-redis:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Mock Database Content
const mockDatabase = {
  user_101: { id: "101", name: "Alice Johnston", role: "System Architect" },
  user_102: { id: "102", name: "Bob Miller", role: "DevOps Engineer" },
};

// Simulated Heavy Database Query (takes 2 seconds)
function fetchFromSlowDatabase(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lookupKey = `user_${userId}`;
      resolve(mockDatabase[lookupKey] || null);
    }, 2000);
  });
}

// API Endpoint implementing Cache-Aside Pattern
app.get("/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const startTime = Date.now();

    // Step 1: Check Redis Cache First
    const cachedUser = await redisClient.get(`user:${userId}`);

    if (cachedUser) {
      const duration = Date.now() - startTime;
      return res.json({
        source: "CACHE_HIT (Redis)",
        time_taken: `${duration}ms`,
        data: JSON.parse(cachedUser),
      });
    }

    // Step 2: Cache Miss - Fetch from the slow database
    const dbUser = await fetchFromSlowDatabase(userId);

    if (!dbUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Step 3: Save to Redis Cache with a Time-To-Live (TTL) of 60 seconds
    // This ensures stale data is automatically cleared out after 1 minute
    await redisClient.setEx(`user:${userId}`, 60, JSON.stringify(dbUser));

    const duration = Date.now() - startTime;
    return res.json({
      source: "CACHE_MISS (Slow Database)",
      time_taken: `${duration}ms`,
      data: dbUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Connect to Redis before starting the server
async function startServer() {
  await redisClient.connect();
  app.listen(PORT, () => {
    console.log(`Caching server running on port ${PORT}...`);
  });
}

startServer();

//
