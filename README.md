Tests whether a domain points to a private IP address, supports IPv4 and IPv6, handles multiple records properly.

A domain can point to multiple IP addresses, for example 
- `8.8.8.8`
- `127.0.0.1`

In this case most software like browsers, curl, etc. will try another IP address if one is unavailable. This can cause security issues when server has can access protected resources on the internal network, provides publicly available api for fetching URL-s and only checks whether the first IP address is public.

#### Options:
- `ipv4` - test A (IPv4) records, defaults to **true**
- `ipv6` - test AAAA (IPv6) records, defaults to **false**

#### Methods
- `isPrivate(domain, callback)` - is the domain private? Supports IP, domain, and URL. `callback(err, private)` is called on finish

#### Example usage:

```
var checker = require('private-ips')({
    ipv6: true
});
checker.isPrivate('some-domain.com', function(err, private) {
    if (! err && ! private) next();
});
```

