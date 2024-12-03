const { body } = require("express-validator")
const { checkEntityExistsIn } = require("./helper")
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
	body("organization_id").notEmpty().withMessage("Organization is required")
	.custom(async (value, {req}) => await checkEntityExistsIn("priority", value, [{"col": "id", "value": value}], "organizations")),
	body("password").notEmpty().withMessage("Password is required")
		.isStrongPassword({minLength: 6, minLowerCase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}).withMessage(
			"Password must be at least 6 characters long, " + 
			"including one lowercase, one uppercase, " + 
			"one number and one symbol."
		),
	body("confirm_password").notEmpty().withMessage("Confirm Password is required").custom((value, {req}) => {
		if (value !== req.body.password)	{
			throw new Error("Passwords don't match")
		}
		else {
			return value
		}
	}),
]

const editUserValidator = [
	body("first_name").notEmpty().withMessage("First Name is required"),
	body("last_name").notEmpty().withMessage("Last Name is required"),
	body("email")
		.isEmail().withMessage("Invalid email")
		.normalizeEmail().custom((value, {req}) => {
		return new Promise((resolve, reject) => {
			db("users").where("email", req.body.email).then((res) => {
				if (res?.length === 0){
					reject(new Error(`User with email ${req.body.email} could not be found`))
				}
				resolve(true)
			})	
		})
	}),
	body("user_role_id").notEmpty().withMessage("user_role_id is required").custom(async (value, {req}) => await checkEntityExistsIn("userRole", value, [{col: "id", value: value}], "user_roles")),
]

const loginValidator = [
	body("email")
		.isEmail().withMessage("Invalid email")
		.normalizeEmail().custom((value, {req}) => {
		return new Promise((resolve, reject) => {
			db("users").where("email", req.body.email).then((res) => {
				if (res?.length === 0){
					reject(new Error(`User with email ${req.body.email} could not be found`))
				}
				resolve(true)
			})	
		})
	}),
	body("password")
		.isLength({min: 6}).withMessage("Invalid Password"),
	body("organization_id").notEmpty().withMessage("Organization is required").custom(async (value, {req}) => await checkEntityExistsIn("organization", value, [{col: "id", value: value}], "organizations"))
]

module.exports = {
	registerValidator,
	editUserValidator,
	loginValidator
}
