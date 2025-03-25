const { body, param } = require("express-validator")
const { checkEntityExistsIn, validateUniqueOrgEmail, validateUniqueUserEmail, validatePasswordAndConfirmation } = require("./helper")
const { BULK_INSERT_LIMIT } = require("../constants")
const db = require("../db/db")
const config = require("../config")
const bcrypt = require("bcrypt")

const editUserImageValidator = [
	body("id").custom(
		async (value, {req}) => 
		await checkEntityExistsIn("organization_user_roles", value, [{col: "user_id", value: value}, {col: "organization_id", value: req.user.organization}], "organization_user_roles")),
	body("image_url").isURL().withMessage("Must be valid URL")
]

const organizationUserRegisterValidator = [
	body("organization.name").notEmpty().withMessage("Organization name is required"),
	...(validateUniqueOrgEmail("organization.email")),
	body("organization.phone_number").isMobilePhone().withMessage("Please enter valid phone number"),
	body("user.first_name").notEmpty().withMessage("First Name is required"),
	body("user.last_name").notEmpty().withMessage("Last Name is required"),
	...(validatePasswordAndConfirmation("user.password", "user.confirm_password")),
	...(validateUniqueUserEmail("user.email")),
]

const editUserValidator = (action) => {
	let validationRules = [
		body("first_name").notEmpty().withMessage("First Name is required"),
		body("last_name").notEmpty().withMessage("Last Name is required"),
	]
	if (action === "adminEditUser"){
		// only admin can edit user role id
		validationRules = [
			...validationRules, 
			param("userId").custom(async (value, {req}) => await checkEntityExistsIn("organization_user_roles", value, [{col: "user_id", value: value}, {col: "organization_id", value: req.user.organization}], "organization_user_roles")),
			body("user_role_id").notEmpty().withMessage("user_role_id is required").custom(async (value, {req}) => await checkEntityExistsIn("userRole", value, [{col: "id", value: value}], "user_roles")),
		]
	}
	if (action === "editOwnUser"){
		validationRules = [
			...validationRules,
			// only validate if the user is choosing to edit their password
			body("confirm_existing_password").if((value, { req }) => {
		        return req.body.check_password;
	        }).notEmpty().withMessage("Confirm Existing Password is required").custom(async (value, {req}) => {
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
				...(validatePasswordAndConfirmation("password", "confirm_password", true))
			]
		}
		// only user can add the organization id when registering.
		// password and confirm password always required when registering
		if (action === "register"){
			validationRules = [
				...validationRules,
				...(validatePasswordAndConfirmation("password", "confirm_password")),
				body("organization_id").notEmpty().withMessage("Organization is required")
				.custom(async (value, {req}) => await checkEntityExistsIn("organization", value, [{"col": "id", "value": value}], "organizations")),
			]
		}
	}
	validationRules = [
		...validationRules,
		...(validateUniqueUserEmail("email", action))
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

const forgotPasswordValidator = [
	// validate whether the user with this email exists
	validateUniqueUserEmail("email", "", true)
]

const resetPasswordValidator = [
	validatePasswordAndConfirmation("password", "confirm_password")
]

const editNotificationTypesValidator = [
	body("ids")
	.isArray({min: 0, max: BULK_INSERT_LIMIT})
	.withMessage("ids must be an array")
	.withMessage(`ids cannot have more than ${BULK_INSERT_LIMIT} ids`),
	body("ids.*").custom(async (value, {req}) => await checkEntityExistsIn("notification-type", value, [
	{
		col: "id",
		value: value,
	},
	], "notification_types"))
]

module.exports = {
	registerValidator: editUserValidator("register"),
	editUserValidator: editUserValidator("adminEditUser"),
	editOwnUserValidator: editUserValidator("editOwnUser"),
	forgotPasswordValidator,
	resetPasswordValidator,
	organizationUserRegisterValidator,
	editNotificationTypesValidator,
	editUserImageValidator,
	loginValidator,
	getUserValidator,
}

