const fs = require('fs')
const http = require('http')
const https = require('https')
const express = require('express')
const minimist = require('minimist')
const jks = require('jks-js')

const httpsPort = 3443
const httpPort = 3000
const argv = minimist(process.argv.slice(2))
console.log('argv', argv)

const config = {
  key: argv['key'] || '',
  cert: argv['cert'] || '',
  ca: argv['ca'] || '',
  requestCert: argv['requestCert'] || argv['requestCert'] === 'true',
  rejectUnauthorized: argv['rejectUnauthorized'] || argv['rejectUnauthorized'] === 'true'
}

let options = {
  // Server-side only to specify whether a server should request a certificate from a connecting client
  requestCert: config.requestCert,

  // server automatically reject clients with invalid certificates
  // This option only has an effect if requestCert is true.
  rejectUnauthorized: config.rejectUnauthorized
}

/*
// for JKS file
const alias = 'aaa-alt'
const jksPassword = 'clientkeystorepassword'
const keystore = jks.toPem(fs.readFileSync('server-keystore.jks'), jksPassword)
key = clientKeystore[alias].key
cert = clientKeystore[alias].cert
*/
if (config.key && config.cert) {
  console.log('config.key', config.key)
  console.log('config.cert', config.cert)
  options = {
    ...options,
    key: fs.readFileSync(config.key, 'utf8'),
    cert: fs.readFileSync(config.cert, 'utf8'),
  }
}

if (config.ca) {
  console.log('config.ca', config.ca)
  options = {
    ...options,
    ca: [fs.readFileSync(config.ca, 'utf8')],
  }
}

const app = express()

app.get('/', (req, res) => {
  if (req.client.authorized) {
    res.writeHead(200)
    res.end('ok-authorized-client\n')


    const clientCert = req.socket.getPeerCertificate()
    console.log(`${new Date()} ${req.connection.remoteAddress} ${req.method} ${req.url}`)
    console.log('Client certificate information:')
    console.log('clientCert', clientCert)
  } else {
    console.log('nook-unauthorized-client')
    res.writeHead(401)
    res.end('nook-unauthorized-client\n')
  }
})

const httpsServer = https.createServer(options, app)
httpsServer.listen(httpsPort, () => {
  console.log(`HTTPS Server running on port ${httpsPort}`)
})

const httpServer = http.createServer(app)
httpServer.listen(httpPort, () => {
  console.log(`HTTP Server running on port ${httpPort}`)
})
