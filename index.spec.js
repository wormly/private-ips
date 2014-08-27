var u = require('wormly-specutils');
var Checker = require('./index');

var PRIVATE_IPV6 = 'fd03:feba:6e34:5b78:5b78:5b78:5b78:5b78';

describe('private ips', function () {
	var checker, dns, cb;

	beforeEach(function () {
		cb = jasmine.createSpy();

		dns = u.stub('resolve4', 'resolve6');

		checker = new Checker({
			ipv4: true,
			ipv6: true,
			dns: dns
		});
	});

	it('error on not parsed', function () {
		checker.isPrivate('://', cb);

		expect(cb).toHaveBeenCalledWith('Could not parse domain');
		expect(dns.resolve4).not.toHaveBeenCalled();
	});

	it('checks private ipv4', function () {
		checker.isPrivate('127.0.0.1', cb);

		expect(cb).toHaveBeenCalledWith(null, true);
		expect(dns.resolve4).not.toHaveBeenCalled();
	});

	it('checks private ipv6', function () {
		checker.isPrivate(PRIVATE_IPV6, cb);

		expect(cb).toHaveBeenCalledWith(null, false);
		expect(dns.resolve4).not.toHaveBeenCalled();
	});

	it('error on all disabled', function () {
		checker.options.ipv4 = false;
		checker.options.ipv6 = false;

		checker.isPrivate('google.com', cb);

		expect(cb).toHaveBeenCalledWith('Does not check neither ipv4, nor ipv6');
		expect(dns.resolve4).not.toHaveBeenCalled();
	});

	it('checks ranges', function () {
		checker.options.ipv6 = false;
		
		checker.isPrivate('google.com', cb);

		expect(dns.resolve4.mostRecentCall.args[0]).toEqual('google.com');
		expect(dns.resolve6).not.toHaveBeenCalled();

		dns.resolve4.mostRecentCall.args[1]('missing');

		expect(cb).toHaveBeenCalledWith(null, false);
	});
	
	it('checks ranges', function () {
		checker.options.ipv6 = false;

		checker.isPrivate('google.com', cb);

		expect(dns.resolve4.mostRecentCall.args[0]).toEqual('google.com');

		dns.resolve4.mostRecentCall.args[1](null, ['127.0.0.1']);

		expect(cb).toHaveBeenCalledWith(null, true);
	});
});