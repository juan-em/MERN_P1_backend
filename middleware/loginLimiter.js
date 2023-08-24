const rateLimit = require('express-rate-limit')
const { logEvents } = require('./logger')

const loginLimiter = rateLimit({
    windowMs: 60*1000, //1 minute
    max: 5, //LImit each Ip to 5 login requests per window per minute
    message: {
        message: 'Too many login attemps from this IP please try again after 60 second pause'
    },
    handler: (req, res, next, options) => { //handler if the limit is achieve
        logEvents(`Too Many Requests ${options.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errorlog.log')
        res.status(options.statusCode).send(options.message)
    },
    standardHeaders: true, //return rate limit info in the Ratelimit headers
    legacyHeaders: false // disable xRateLimit headers
})

module.exports = loginLimiter