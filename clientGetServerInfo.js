const sslCertificate = require('get-ssl-certificate')
const minimist = require('minimist')

const argv = minimist(process.argv.slice(2));
const [hostname, port] = argv['host'].split(':')
const protocol = 'https:'
const timeout = 250

sslCertificate.get(hostname, timeout, port, protocol).then(function (certificate) {
  // certificate is a JavaScript object
  console.log(certificate)
})
