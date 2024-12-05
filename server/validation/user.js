const { body, param } = require("express-validator")
const { checkEntityExistsIn } = require("./helper")
const db = require("../db/db")
const config = require("../config")
const bcrypt = require("bcrypt")

// const registerValidator = [
// 	body("first_name").notEmpty().withMessage("First Name is required"),
// 	body("last_name").notEmpty().withMessage("Last Name is required"),
// 	body("email").notEmpty().withMessage("Email is required")
// 	.isEmail().withMessage("Invalid email")
// 	.normalizeEmail().custom((value, {req}) => {
// 		return new Promise((resolve, reject) => {
// 			db("users").where("email", req.body.email).then((res) => {
// 				if (res?.length > 0){
// 					reject(new Error("Email already in use"))
// 				}
// 				resolve(true)
// 			})	
// 		})
// 	}),
// 	body("organization_id").notEmpty().withMessage("Organization is required")
// 	.custom(async (value, {req}) => await checkEntityExistsIn("priority", value, [{"col": "id", "value": value}], "organizations")),
// 	body("password").notEmpty().withMessage("Password is required")
// 		.isStrongPassword({minLength: 6, minLowerCase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}).withMessage(
// 			"Password must be at least 6 characters long, " + 
// 			"including one lowercase, one uppercase, " + 
// 			"one number and one symbol."
// 		),
// 	body("confirm_password").notEmpty().withMessage("Confirm Password is required").custom((value, {req}) => {
// 		if (value !== req.body.password)	{
// 			throw new Error("Passwords don't match")
// 		}
// 		else {
// 			return value
// 		}
// 	}),
// ]

const editUserValidator = (action) => {
	let validationRules = [
		body("first_name").notEmpty().withMessage("First Name is required"),
		body("last_name").notEmpty().withMessage("Last Name is required"),
	]
	if (action === "adminEditUser"){
		// only admin can edit user role id
		validationRules = [
			...validationRules, 
			body("user_role_id").notEmpty().withMessage("user_role_id is required").custom(async (value, {req}) => await checkEntityExistsIn("userRole", value, [{col: "id", value: value}], "user_roles")),
		]
	}
	if (action === "editOwnUser"){
		validationRules = [
			...validationRules,
			// only validate if the user is choosing to edit their password
			body("confirm_existing_password").if(body('change_password').exists()).notEmpty().withMessage("Confirm Existing Password is required").custom(async (value, {req}) => {
				const user = await db("users").where("id", req.user.id).first()
				const storedHash = user?.password
				const result = await bcrypt.compare(value, storedHash)
				if (!result){
					throw new Error("Existing password was incorrect.")
				}
			})
		]	
	}
	if (action === "editOwnUser" || action === "register"){
		if (action === "editOwnUser"){
			validationRules = [
				...validationRules,
				// only validate if the user is choosing to edit their password on the accounts page
				body("password").if(body('change_password').exists()).notEmpty().withMessage("Password is required")
					.isStrongPassword({minLength: 6, minLowerCase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}).withMessage(
						"Password must be at least 6 characters long, " + 
						"including one lowercase, one uppercase, " + 
						"one number and one symbol."
					),
				body("confirm_password").if(body('change_password').exists()).notEmpty().withMessage("Confirm Password is required").custom((value, {req}) => {
					if (value !== req.body.password)	{
						throw new Error("Passwords don't match")
					}
					else {
						return value
					}
				}),
			]
		}
		// only user can add the organization id when registering.
		// password and confirm password always required when registering
		if (action === "register"){
			validationRules = [
				...validationRules,
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
				body("organization_id").notEmpty().withMessage("Organization is required")
				.custom(async (value, {req}) => await checkEntityExistsIn("organization", value, [{"col": "id", "value": value}], "organizations")),
			]
		}
	}
	validationRules = [
		...validationRules,
		body("email").notEmpty().withMessage("Email is required")
		.isEmail().withMessage("Invalid email")
		.normalizeEmail().custom((value, {req}) => {
			return new Promise((resolve, reject) => {
				db("users").modify((queryBuilder) => {
					// exclude the current user if editing own user
					if (action === "editOwnUser"){
						queryBuilder
						.join("organization_user_roles", "organization_user_roles.user_id", "=", "users.id")
						.where("organization_user_roles.organization_id", req.user.organization)
						.whereNot("users.id", req.user.id)
					}
				}).where("email", req.body.email).then((res) => {
					if (res?.length > 0){
						reject(new Error("Email already in use"))
					}
					resolve(true)
				})	
			})
		}),
	]	
	return validationRules
}


const getUserValidator = [
	param("userId").custom(async (value, {req}) => await checkEntityExistsIn("organizationUserRole", value, [{col: "user_id", value: value}, {col: "organization_id", value: req.user.organization}], "organization_user_roles")),
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
	registerValidator: editUserValidator("register"),
	editUserValidator: editUserValidator("adminEditUser"),
	editOwnUserValidator: editUserValidator("editOwnUser"),
	loginValidator,
	getUserValidator,
}

