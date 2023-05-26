const fs = require('fs')
const https = require('https')
const minimist = require('minimist')
const jks = require('jks-js')
const argv = minimist(process.argv.slice(2))

console.log('argv', argv)

const [hostname, port] = argv['host'].split(':')
const config = {
  clientCertFormat: argv['clientCertFormat'] || '',
  key: argv['key'] || '',
  cert: argv['cert'] || '',
  ca: argv['ca']
}

const message = { msg: 'Hello!' }
let options = {
  hostname: hostname,
  port: port,
  path: '/',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(message))
  }
}

/*
// for JKS file
const alias = 'bbb-alt'
const jksPassword = 'clientkeystorepassword'
const keystore = jks.toPem(fs.readFileSync('client-keystore.jks'), jksPassword)
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

const req = https.request(options, (res) => {
  const cert = res.connection.getPeerCertificate()

  console.log('res.socket.encrypted', res.socket.encrypted)
  console.log('res.socket.authorized', res.socket.authorized)
  console.log('res.client.encrypted', res.client.encrypted)
  console.log('res.client.authorized', res.client.authorized)
  console.log('res.statusCode', res.statusCode)
  console.log('res.headers', res.headers)
  console.log('Server Host Name: ' + cert.subject.CN)

  let rawData = ''
  res.on('data', (data) => {
    rawData += data
    process.stdout.write(rawData)
  })

  res.on('end', function () {
    if (rawData.length > 0) {
      console.log(`Received message: ${rawData}`)
    }
    console.log(`TLS Connection closed!`)
    req.end()
    return
  })
})

req.on('socket', function (socket) {
  socket.on('secureConnect', function () {
    if (socket.authorized === false) {
      console.log(`SOCKET AUTH FAILED ${socket.authorizationError}`)
    }
    console.log('TLS Connection established successfully!')
  })
  socket.setTimeout(10000)
  socket.on('timeout', function () {
    console.log('TLS Socket Timeout!')
    req.end() // force end
    return
  })
})

req.on('error', function (err) {
  console.log(`TLS Socket ERROR (${err})`)
  req.end()
  return
})
req.write(JSON.stringify(message))
