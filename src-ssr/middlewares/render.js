/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

import { ssrMiddleware } from 'quasar/wrappers'

/**
 * This middleware is executed for all requests.
 * It's the SSR render middleware.
 */

export default ssrMiddleware(({ app, resolve, render }) => {
  // Security headers
  app.use((req, res, next) => {
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
    res.setHeader('Access-Control-Allow-Origin', 'https://harmlesskey.com')

    // Add other security headers if needed
    // res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    // res.setHeader('X-Content-Type-Options', 'nosniff')

    next()
  })

  // Note: Static file serving is handled by Quasar automatically in SSR mode

  // This should be last middleware - renders the page
  app.get(resolve.urlPath('*'), (req, res) => {
    res.setHeader('Content-Type', 'text/html')

    render({ req, res })
      .then(html => {
        // Success - send the rendered HTML
        res.send(html)
      })
      .catch(err => {
        // Error occurred during rendering
        console.error('SSR-error', err)

        if (err.url) {
          // Handle redirects
          if (err.code) {
            res.redirect(err.code, err.url)
          } else {
            res.redirect(err.url)
          }
        } else if (err.code === 404) {
          // 404 - Page Not Found
          res.status(404).send('404 | Page Not Found')
        } else {
          // 500 - Internal Server Error
          res.status(500).send('500 | Internal Server Error')

          if (process.env.DEV) {
            console.error(`500 on ${req.url}`)
            console.error(err)
            console.error(err.stack)
          }
        }
      })
  })
})
