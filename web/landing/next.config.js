const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Nécessaire dans un monorepo npm workspaces pour éviter le warning lockfile
  outputFileTracingRoot: path.join(__dirname, '../../'),
}

module.exports = nextConfig
