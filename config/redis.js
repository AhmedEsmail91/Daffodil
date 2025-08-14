const redis = require('redis');
require("dotenv").config({quiet:true});

const host = process.env.REDIS_HOST
const port =process.env.REDIS_PORT|| 6379
const pass = process.env.REDIS_PASS|| null

const client = redis.createClient({
  url: pass ? `redis://:${pass}@${host}:${port}` : `redis://${host}:${port}`
});

client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();
client.on("connect", () => {
    console.log("Redis client connected successfully");
});
module.exports = client;
