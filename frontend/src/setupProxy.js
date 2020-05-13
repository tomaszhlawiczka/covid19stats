const {createProxyMiddleware} = require('http-proxy-middleware');
const pkg = require('../package.json');
const target = process.env.PROXY || pkg.proxy || 'http://127.0.0.1:5000';
const proxy = createProxyMiddleware({target});

module.exports = app =>
	target &&
	app.use((req, res, next) => {
		return req.url.startsWith('/api') ? proxy(req, res, next) : next()
	})
