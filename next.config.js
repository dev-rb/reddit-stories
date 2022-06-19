/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')

module.exports = withPWA({
    reactStrictMode: true,
    pwa: {
        // disable: true,
        dest: 'public',
        // mode: 'production',
        register: true,
        skipWaiting: true,
        // runtimeCaching,
        // sw: 'service-worker.js',
        // cacheOnFrontEndNav: true,
    }
})