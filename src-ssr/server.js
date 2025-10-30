/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 */

import express from 'express'
import compression from 'compression'

/**
 * Create the Express app instance
 * This function is called by Quasar SSR
 */

export async function create (/* { ... } */) {
  const app = express()

  // Disable x-powered-by header
  app.disable('x-powered-by')

  // Enable gzip compression
  app.use(compression({ threshold: 0 }))

  // Parse JSON bodies
  app.use(express.json())

  // TODO: API routes disabled for now - need to convert services to ESM first
  // The API routes import from src/services which are still CommonJS
  // This will be addressed in a later phase of the migration

  return app
}

/**
 * Serve static content
 * This function is called by Quasar SSR
 */
export function serveStaticContent (/* { app, serve } */) {
  // Quasar handles static file serving automatically
  // This function can be used to add custom static file serving if needed
}

/**
 * Start listening on a port
 * This function is called by Quasar SSR
 */
export async function listen ({ app, port, isReady }) {
  if (isReady && typeof isReady === 'function') {
    await isReady()
  }
  return app.listen(port, () => {
    console.log(`Server listening at port ${port}`)
  })
}
