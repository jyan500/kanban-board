const db = require("../db/db")
const { getFromNestedObject } = require("../helpers/functions")
const { body, param } = require("express-validator")

/* 
	For use in express validator 
	- for custom validators, return a promise that resolves true 
	if the specified foreign key is found in its respective table.
*/
const validateKeyExists = async (key, keyValue, tableName) => {
	return new Promise((resolve, reject) => {
		db(tableName).where("id", keyValue).then((res) => {
			if (res?.length === 0){
				reject(new Error(`${key} with id ${keyValue} could not be found`))
			}
			resolve(true)
		})
	})	
}

const entityInOrganization = async (orgId, key, keyValue, tableName) => {
	return new Promise((resolve, reject) => {
		db(tableName).where("id", keyValue).where("organization_id", orgId).then((res) => {
			if (res?.length === 0){
				reject(new Error(`${key} id ${keyValue } does not exist`))
			}
			resolve(true)
		})	
	})	
}

const checkEntityExistsIn = async (key, colValue, colValues, tableName) => {
	return new Promise((resolve, reject) => {
		let query = db(tableName)	
		for (const cv of colValues){
			const {col, value} = cv
			query.where(col, value)
		}
		query.then((res) => {
			if (res?.length === 0){
				reject(new Error(`${key} with id ${colValue} does not exist`))
			}
			resolve(true)
		})
	})	
}

/* 
	For use in express validator 
	- for custom validators, return a promise that resolves true 
	if the specified key is not found in the respective table, essentially
	checking for uniqueness.
*/
const checkUniqueEntity = async (key, colValue, colValues, tableName) => {
	return new Promise((resolve, reject) => {
		let query = db(tableName)
		for (const cv of colValues){
			const {col, value} = cv 
			query.where(col, value)
		}
		query.then((res) => {
			if (res?.length > 0){
				reject(new Error(`${key} with id ${colValue} already exists`))
			}
			resolve(true)
		})
	})
}

/* 
	Return express validation for email
*/
const validateUniqueEmail = (emailField = "email", action = "") => {
	return [
		body(emailField).notEmpty().withMessage("Email is required")
		.isEmail().withMessage("Invalid email")
		.normalizeEmail().custom((value, {req}) => {
			return new Promise((resolve, reject) => {
				db("users").modify((queryBuilder) => {
					// exclude the current user if editing own user,
					// or exclude the selected user's email if editing the selected user
					if (action === "editOwnUser" || action === "adminEditUser"){
						queryBuilder
						.join("organization_user_roles", "organization_user_roles.user_id", "=", "users.id")
						.where("organization_user_roles.organization_id", req.user.organization)
						.whereNot("users.id", action === "adminEditUser" ? req.params.userId : req.user.id)
					}
				}).where("email", value).then((res) => {
					if (res?.length > 0){
						reject(new Error("Email already in use"))
					}
					resolve(true)
				})	
			})
		})
	]
}

/* 
	Return express validation for password and confirm password fields
*/
const validatePasswordAndConfirmation = (passwordField = "password", confirmPasswordField = "confirm_password", conditionalCheck = false) => {
	let expressPasswordBody = body(passwordField) 
	let expressConfirmPasswordBody = body(confirmPasswordField)
	if (conditionalCheck){
		expressPasswordBody = body(passwordField).if((value, { req }) => {
	        return req.body.check_password;
	    })
	    expressConfirmPasswordBody = body(confirmPasswordField).if((value, { req }) => {
	        return req.body.check_password;
	    })
	}
	return [
		expressPasswordBody.notEmpty().withMessage("Password is required")
			.isStrongPassword({minLength: 6, minLowerCase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}).withMessage(
				"Password must be at least 6 characters long, " + 
				"including one lowercase, one uppercase, " + 
				"one number and one symbol."
		),
		expressConfirmPasswordBody.notEmpty().withMessage("Confirm Password is required").custom((value, {req}) => {
			if (value !== getFromNestedObject(req.body, passwordField)){
				throw new Error("Passwords don't match")
			}
			else {
				return value
			}
		}),	
	]
}

module.exports = {
	checkEntityExistsIn,
	checkUniqueEntity,
	entityInOrganization,
	validateKeyExists,
	validatePasswordAndConfirmation,
	validateUniqueEmail,
}
