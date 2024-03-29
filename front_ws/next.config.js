/** @type {import('next').NextConfig} */
require('dotenv').config();
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL,
    WS_URL: process.env.WS_URL,
  },
}

module.exports = nextConfig
