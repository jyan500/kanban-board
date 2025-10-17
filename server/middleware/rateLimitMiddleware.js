const rateLimit = require("express-rate-limit");

const rateLimitParams = {
    handler: (req, res) => {
	    res.status(429).json({
		    status: 429,
		    errors: ['Too many requests, please try again later.'],
	    })
	},
	standardHeaders: true,
	legacyHeaders: false,
}

const ticketSummaryRateLimiter = rateLimit({
    ...rateLimitParams,
	windowMs: 60 * 1000, // 1 minute
	max: 5, // 5 requests per 1 minute
})

const authRateLimiter = rateLimit({
    ...rateLimitParams,
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // 5 max in the window,
})

// apply rate limiting only in production
const applyRateLimit = (limiter) => {
    return (req, res, next) => {
        if (process.env.ENVIRONMENT === "PROD") {
            return limiter(req, res, next);
        }
        next();
    }
}

module.exports = { 
    rateLimitTicketSummary: applyRateLimit(ticketSummaryRateLimiter), 
    rateLimitAuth: applyRateLimit(authRateLimiter)
}
