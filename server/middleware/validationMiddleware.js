require("dotenv").config()
const { validationResult } = require("express-validator")

/*  used to parse the validation result from express-validator */
function handleValidationResult(req, res, next){
	const validationErrors = validationResult(req)
	let errors = []
	if (!validationErrors.isEmpty()){
		Object.keys(validationErrors.mapped()).forEach(field => {
			errors.push(`${validationErrors.mapped()[field]["msg"]}`)
		})
		res.status(422).json({errors: errors})
	}
	else {
		next()
	}
}

module.exports = {
	handleValidationResult
}