/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
}

const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')

module.exports = withPWA({
  pwa: {
    disable: true,
    dest: 'public',
    mode: 'production',
    register: true,
    skipWaiting: true,
    runtimeCaching,
    sw: 'service-worker.js',
    cacheOnFrontEndNav: true,
  },
  workbox: {
    clientsClaim: false
  }

})