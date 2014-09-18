var async = require('async');
var iplib = require('ip');
var parse = require('url').parse;
var extend = require('node.extend');

module.exports = Checker;

var defaultOptions = {
	ipv4: true,
	ipv6: false,
	dns: require('dns')
};

function Checker(options) {
	this.options = extend(true, defaultOptions, options);
	this.dns = this.options.dns;
}

Checker.prototype.isPrivate = function (domain, cb) {
	domain = this._parseDomain(domain);

	if (!domain) {
		return cb("Could not parse domain");
	}

	if (this._isIPV4(domain) || this._isIPV6(domain)) {
		return cb(null, iplib.isPrivate(domain));
	}

	var types = [];

	this.options.ipv4 && types.push(4);
	this.options.ipv6 && types.push(6);

	if (!types.length) {
		var err = "Does not check neither ipv4, nor ipv6";
		console.error(err);
		return cb(err);
	}
	
	types = types.map(function(type) {
		return this._checkDomain.bind(this, domain, type)
	}.bind(this));
	
	async.parallel(types, function(err, results) {
		if (err) return cb(err); 
		
		var hasPrivateIps = results.filter(function(isprivate) {
			return isprivate;
		}).length > 0;
		
		cb(err, hasPrivateIps);
	});
};

Checker.prototype._checkDomain = function (domain, type, cb) {
	this.dns['resolve'+type](domain, function (e, addresses) {
		if (e) return cb(e);
		
		cb(null, this._hasPrivateIps(addresses));
	}.bind(this));
};

Checker.prototype._hasPrivateIps = function (results) {
	for (var i = 0; i < results.length; i++) {
		if (iplib.isPrivate(results[i])) return true;
	}

	return false;
};

Checker.prototype._parseDomain = function (domain) {
	if (domain.indexOf('://') === -1) return domain;

	return parse(domain).hostname;
};

Checker.prototype._isIPV4 = function (string) {
	return /^(\d{1,3}\.){3,3}\d{1,3}$/.test(string);
};

Checker.prototype._isIPV6 = function (string) {
	return /^[a-f0-9:]+$/.test(string);
};