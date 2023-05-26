# SSL mutual authentication

SSL Mutual authentication where server and client verify each other, instead of verifying server as usual.

In practical daily SSL, browser and website for example. Browser only need to verify server. But in some cases server want to verify client as well. Here is an tutorial on how to setup mutual authentication on Node.js with CA (Certificate Authority) and without CA (self-signed). In this tutorial
- `KEY` = private key
- `CRT` = certificate
- `CSR` = certificate signing request

## Note

- Clients use the server's public key in this certificate to encrypt data that only the server can decrypt with its private key, this is why we have to sent `CRT` to client.
- We generate `KEY`
- We generate `CSR` from `KEY`
- We generate `CRT` from `CSR` and sign with `KEY`
- We generate `PKC12` from `CRT` and `KEY`
- We convert `PKC12` to `JKS`
- Privacy-Enhanced Mail (PEM) is a de facto file format for storing and sending cryptographic keys, certificates, and other data, based on a set of 1993 IETF standards defining "privacy-enhanced mail."
- Transport Layer Security (TLS) is an encryption protocol in wide use on the Internet. TLS, which was formerly called SSL
- self-signed TLS/SSL certificate is not signed by a publicly trusted certificate authority (CA) but instead by the developer or company that is responsible for the website
- TrustManager is Java specific interface to verify the ceritificate which require Truststore file
- Truststore file in Java = CA-Certificate file
- Keystore = `JKS` (Java KeyStore)
- `.pem` = file that contain different types of cryptographic objects, including the same X.509 certificate in a base64-encoded format
- `CRT` = file that contain an `X.509 certificate` for SSL/TLS
- `CRT` = certificate issued to a specific domain contains public key, subject details (such as the server's domain name), the issuing authority, the validity period, etc.
- CA certificate = signed and issued the server certificate, contains CA's public key, subject details (such as the CA's name), the issuer (usually itself for Root CAs), validity period, etc.
- The CA certificate is used for verifying the authenticity of the server certificate. Browsers and operating systems maintain a list of trusted CAs

## Prerequisite

1. Install [Node.js](https://nodejs.org/en), and `npm install` to install packages needed
2. Install uility tool: `openssl`, `keytool`, `md5`

