const { body } = require("express-validator")
const db = require("../db/db")


const registerValidator = [
	body("first_name").notEmpty().withMessage("First Name is required"),
	body("last_name").notEmpty().withMessage("Last Name is required"),
	body("email").notEmpty().withMessage("Email is required")
	.isEmail().withMessage("Invalid email")
	.normalizeEmail().custom((value, {req}) => {
		return new Promise((resolve, reject) => {
			db("users").where("email", req.body.email).then((res) => {
				if (res?.length > 0){
					reject(new Error("Email already in use"))
				}
				resolve(true)
			})	
		})
	}),
	body("password").notEmpty().withMessage("Password is required")
		.isLength({min: 6}).withMessage("Password must be at least 6 characters long"),
	body("confirm_password").notEmpty().withMessage("Confirm Password is required").custom((value, {req}) => {
		if (value !== req.body.password)	{
			throw new Error("Passwords don't match")
		}
		else {
			return value
		}
	})
]

const loginValidator = [
	body("email")
		.isEmail().withMessage("Invalid email")
		.normalizeEmail(),
	body("password")
		.isLength({min: 6}).withMessage("Invalid Password")
]

module.exports = {
	registerValidator,
	loginValidator
}