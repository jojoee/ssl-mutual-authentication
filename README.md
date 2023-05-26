# SSL mutual authentication

SSL Mutual authentication where server and client verify each other, instead of verifying server as usual.

In practical daily SSL, browser and website for example. Browser only need to verify server. But in some cases server want to verify client as well. Here is an tutorial on how to setup mutual authentication on Node.js with CA (Certificate Authority) and without CA (self-signed). In this tutorial
- `KEY` = private key
- `CRT` = certificate
- `CSR` = certificate signing request
