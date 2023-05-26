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

## Getting Started

### Step 1) Add test domain into `hosts` file

```bash
# as root
echo '127.0.0.1 server.aaa.com' >> /etc/hosts
echo '127.0.0.1 client.bbb.com' >> /etc/hosts
cat /etc/hosts # to verify
```

### Step 2) Generate server-CA-KEY and server-CA-CRT

```bash
openssl req -new -x509 -days 365 -keyout server-ca-key.pem -out server-ca-crt.pem # 123456
# Generating a RSA private key
# .........................................................+++++
# ......................+++++
# writing new private key to 'server-ca-key.pem'
# Enter PEM pass phrase:
# Verifying - Enter PEM pass phrase:
# -----
# You are about to be asked to enter information that will be incorporated
# into your certificate request.
# What you are about to enter is what is called a Distinguished Name or a DN.
# There are quite a few fields but you can leave some blank
# For some fields there will be a default value,
# If you enter '.', the field will be left blank.
# -----
# Country Name (2 letter code) [AU]:IT
# State or Province Name (full name) [Some-State]:Florence
# Locality Name (eg, city) []:Campi Bisenzio
# Organization Name (eg, company) [Internet Widgits Pty Ltd]:AAA Ltd
# Organizational Unit Name (eg, section) []:DevOps
# Common Name (e.g. server FQDN or YOUR name) []:aaa.com
# Email Address []:info@aaa.com
```

### Step 3) Genearate server-KEY an server-CSR

```bash
openssl genrsa -out server-key.pem 4096
openssl req -new -sha256 -key server-key.pem -out server-csr.pem
# You are about to be asked to enter information that will be incorporated
# into your certificate request.
# What you are about to enter is what is called a Distinguished Name or a DN.
# There are quite a few fields but you can leave some blank
# For some fields there will be a default value,
# If you enter '.', the field will be left blank.
# -----
# Country Name (2 letter code) [AU]:IT
# State or Province Name (full name) [Some-State]:Florence
# Locality Name (eg, city) []:Campi Bisenzio
# Organization Name (eg, company) [Internet Widgits Pty Ltd]:AAA Ltd
# Organizational Unit Name (eg, section) []:DevOps
# Common Name (e.g. server FQDN or YOUR name) []:server.aaa.com
# Email Address []:info@aaa.com

# Please enter the following 'extra' attributes
# to be sent with your certificate request
# A challenge password []:
# An optional company name []:
```

### Step 4) Generate server-CRT with CA and without CA (self-signed)

Server using `server-ca-key.pem` or `server-key.pem` (self-signed) to sign certificate.

```bash
# CA
openssl x509 -req -days 365 -in server-csr.pem -CA server-ca-crt.pem -CAkey server-ca-key.pem -CAcreateserial -out server-ca-signed-crt.pem
openssl verify -CAfile server-ca-crt.pem server-ca-signed-crt.pem

# self-signed
openssl x509 -req -days 365 -in server-csr.pem -signkey server-key.pem -out server-self-signed-crt.pem
openssl verify -CAfile server-self-signed-crt.pem server-self-signed-crt.pem
```

### Step 5) Generate client-CA-KEY and server-CA-CRT

```bash
openssl req -new -x509 -days 365 -keyout client-ca-key.pem -out client-ca-crt.pem
# Generating a RSA private key
# ............+++++
# ............................................+++++
# writing new private key to 'client-ca-key.pem'
# Enter PEM pass phrase:
# Verifying - Enter PEM pass phrase:
# -----
# You are about to be asked to enter information that will be incorporated
# into your certificate request.
# What you are about to enter is what is called a Distinguished Name or a DN.
# There are quite a few fields but you can leave some blank
# For some fields there will be a default value,
# If you enter '.', the field will be left blank.
# -----
# Country Name (2 letter code) [AU]:IT
# State or Province Name (full name) [Some-State]:Rome
# Locality Name (eg, city) []:Rome
# Organization Name (eg, company) [Internet Widgits Pty Ltd]:BBB Ltd
# Organizational Unit Name (eg, section) []:
# Common Name (e.g. server FQDN or YOUR name) []:bbb.com
# Email Address []:info@bbb.com
```

### Step 6) Genearate server-KEY an server-CSR

```bash
openssl genrsa -out client-key.pem 4096
openssl req -new -sha256 -key client-key.pem -out client-csr.pem
# You are about to be asked to enter information that will be incorporated
# into your certificate request.
# What you are about to enter is what is called a Distinguished Name or a DN.
# There are quite a few fields but you can leave some blank
# For some fields there will be a default value,
# If you enter '.', the field will be left blank.
# -----
# Country Name (2 letter code) [AU]:IT
# State or Province Name (full name) [Some-State]:Rome
# Locality Name (eg, city) []:Rome
# Organization Name (eg, company) [Internet Widgits Pty Ltd]:BBB Ltd
# Organizational Unit Name (eg, section) []:
# Common Name (e.g. server FQDN or YOUR name) []:client.bbb.com
# Email Address []:info@bbb.com

# Please enter the following 'extra' attributes
# to be sent with your certificate request
# A challenge password []:
# An optional company name []:
```

### Step 7) Generate client-CRT (certificate) with CA and without CA (self-signed)

Client using `client-ca-key.pem` or `client-key.pem` (self-signed) to sign certificate.

```bash
# CA
openssl x509 -req -days 365 -in client-csr.pem -CA client-ca-crt.pem -CAkey client-ca-key.pem -CAcreateserial -out client-ca-signed-crt.pem
openssl verify -CAfile client-ca-crt.pem client-ca-signed-crt.pem

# self-signed
openssl x509 -req -days 365 -in client-csr.pem -signkey client-key.pem -out client-self-signed-crt.pem
openssl verify -CAfile client-self-signed-crt.pem client-self-signed-crt.pem
```

## How to run and test

```bash
# Server CA, Client CA
node server.js --key=server-key.pem --cert=server-ca-signed-crt.pem --ca=client-ca-crt.pem --requestCert --rejectUnauthorized
node client.js --key=client-key.pem --cert=client-ca-signed-crt.pem --ca=server-ca-crt.pem --host=server.aaa.com:3443 # ok-authorized-client

# Server self-signed, Client self-signed
node server.js --key=server-key.pem --cert=server-self-signed-crt.pem --ca=client-self-signed-crt.pem --requestCert --rejectUnauthorized
node client.js --key=client-key.pem --cert=client-self-signed-crt.pem --ca=server-self-signed-crt.pem --host=server.aaa.com:3443 # ok-authorized-client

# Server CA, Client self-signed
node server.js --key=server-key.pem --cert=server-ca-signed-crt.pem --ca=client-self-signed-crt.pem --requestCert --rejectUnauthorized
node client.js --key=client-key.pem --cert=client-self-signed-crt.pem --ca=server-ca-crt.pem --host=server.aaa.com:3443 # ok-authorized-client

# Server self-signed, Client CA
node server.js --key=server-key.pem --cert=server-self-signed-crt.pem --ca=client-ca-crt.pem --requestCert --rejectUnauthorized
node client.js --key=client-key.pem --cert=client-ca-signed-crt.pem --ca=server-self-signed-crt.pem --host=server.aaa.com:3443 # ok-authorized-client
```

## JKS (Java KeyStore)

`JKS` is a Java specific format. `KEY` + `CRT` => `PKC12` => `JKS`, change `yourkeystorepassword` password to your choice.

```bash
# Server
rm ./server-keystore.p12 ./server-keystore.jks
openssl pkcs12 -export -in server-ca-signed-crt.pem -inkey server-key.pem -out server-keystore.p12 -name aaa-alt -password pass:serverkeystorepassword
keytool -importkeystore -srckeystore server-keystore.p12 -srcstoretype PKCS12 -destkeystore server-keystore.jks -deststoretype JKS -srcstorepass serverkeystorepassword -deststorepass serverkeystorepassword
# Importing keystore server-keystore.p12 to server-keystore.jks...
# Entry for alias aaa-alt successfully imported.
# Import command completed:  1 entries successfully imported, 0 entries failed or cancelled

# Client
rm ./client-keystore.p12 ./client-keystore.jks
openssl pkcs12 -export -in client-ca-signed-crt.pem -inkey client-key.pem -out client-keystore.p12 -name bbb-alt -password pass:clientkeystorepassword
keytool -importkeystore -srckeystore client-keystore.p12 -srcstoretype PKCS12 -destkeystore client-keystore.jks -deststoretype JKS -srcstorepass clientkeystorepassword -deststorepass clientkeystorepassword
# Importing keystore client-keystore.p12 to client-keystore.jks...
# Entry for alias bbb-alt successfully imported.
# Import command completed:  1 entries successfully imported, 0 entries failed or cancelled
```

## Validate if `KEY` and `CSR` and `CRT` file are comptible to each others

"modulus" should be the same to all. If the module match, it means they are meant to be used together.

```bash
# Server
openssl rsa -noout -modulus -in server-key.pem | openssl md5
# (stdin)= b8383414c800f6b8bbe6c8058b7d4f10
openssl req -noout -modulus -in server-csr.pem | openssl md5
# (stdin)= b8383414c800f6b8bbe6c8058b7d4f10
openssl x509 -noout -modulus -in server-ca-signed-crt.pem | openssl md5
# (stdin)= b8383414c800f6b8bbe6c8058b7d4f10
openssl x509 -noout -modulus -in server-self-signed-crt.pem | openssl md5
# (stdin)= b8383414c800f6b8bbe6c8058b7d4f10

# Client
openssl rsa -noout -modulus -in client-key.pem | openssl md5
# (stdin)= 5b87a3317a392f1350d54f8f99837d8b
openssl req -noout -modulus -in client-csr.pem | openssl md5
# (stdin)= 5b87a3317a392f1350d54f8f99837d8b
openssl x509 -noout -modulus -in client-ca-signed-crt.pem | openssl md5
# (stdin)= 5b87a3317a392f1350d54f8f99837d8b
openssl x509 -noout -modulus -in client-self-signed-crt.pem | openssl md5
# (stdin)= 5b87a3317a392f1350d54f8f99837d8b
```

## Validate if `JSK` with others

Need to convert back `JKS` => `PCK12` => `CRT` + `KEY`

```bash
rm ./degenerate-server-keystore.p12
keytool -importkeystore -srckeystore server-keystore.jks -destkeystore degenerate-server-keystore.p12 -srcstoretype jks -srcstorepass serverkeystorepassword -deststoretype pkcs12 -deststorepass serverkeystorepassword -alias aaa-alt
# Importing keystore server-keystore.jks to degenerate-server-keystore.p12...
openssl pkcs12 -in degenerate-server-keystore.p12 -nocerts -nodes -passin pass:serverkeystorepassword | openssl rsa > degenerate-server-key.pem
openssl pkcs12 -in degenerate-server-keystore.p12 -nokeys -passin pass:serverkeystorepassword | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > degenerate-server-ca-signed-crt.pem

# It should be the same
md5 server-key.pem
# MD5 (server-key.pem) = 99bd7b72b95e9f739694d2b0bc131a8e
md5 degenerate-server-key.pem
# MD5 (degenerate-server-key.pem) = 99bd7b72b95e9f739694d2b0bc131a8e

# It should be the same
md5 server-ca-signed-crt.pem
# MD5 (server-ca-signed-crt.pem) = a56809780290fda9736c08841a8b1330
md5 degenerate-server-ca-signed-crt.pem
# MD5 (degenerate-server-ca-signed-crt.pem) = a56809780290fda9736c08841a8b1330
```

## Read `JKS` file

```bash
keytool -v -list -keystore server-keystore.jks -storepass "serverkeystorepassword" > server-keystore.jks.txt
keytool -v -list -keystore client-keystore.jks -storepass "clientkeystorepassword" > client-keystore.jks.txt
```

## Read `CRT` file

```bash
# Server
openssl x509 -in server-ca-signed-crt.pem -text -noout > server-ca-signed-crt.pem.txt
openssl x509 -in server-self-signed-crt.pem -text -noout > server-self-signed-crt.pem.txt

# Client
openssl x509 -in client-ca-signed-crt.pem -text -noout > client-ca-signed-crt.pem.txt
openssl x509 -in client-self-signed-crt.pem -text -noout > client-self-signed-crt.pem.txt
```

## Check if server have SSL setup

```bash
openssl s_client -connect server.aaa.com:3443
openssl s_client -connect server.aaa.com:3443 | openssl x509 -noout -dates
# depth=0 C = IT, ST = Florence, L = Campi Bisenzio, O = AAA Ltd, OU = DevOps, CN = server.aaa.com, emailAddress = info@aaa.com
# verify error:num=20:unable to get local issuer certificate
# verify return:1
# depth=0 C = IT, ST = Florence, L = Campi Bisenzio, O = AAA Ltd, OU = DevOps, CN = server.aaa.com, emailAddress = info@aaa.com
# verify error:num=21:unable to verify the first certificate
# verify return:1
# depth=0 C = IT, ST = Florence, L = Campi Bisenzio, O = AAA Ltd, OU = DevOps, CN = server.aaa.com, emailAddress = info@aaa.com
# verify return:1
# 140704365749824:error:1409445C:SSL routines:ssl3_read_bytes:tlsv13 alert certificate required:ssl/record/rec_layer_s3.c:1544:SSL alert number 116
# notBefore=May 25 11:23:02 2023 GMT
# notAfter=May 24 11:23:02 2024 GMT
```

## Check if server require client-CRT

```bash
curl -k https://server.aaa.com:3443
# soft reject if "--requestCert", client able to connect, server knows the client is unauthorized and decide to how to with it
# hard reject if "--requestCert --rejectUnauthorized", client not able to connect
```
