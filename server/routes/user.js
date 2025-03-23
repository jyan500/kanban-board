require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const router = express.Router()
const config = require("../config")
const db = require("../db/db")
const { DEFAULT_STATUSES } = require("../constants")
const userValidator = require("../validation/user")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const { body, validationResult } = require("express-validator")
const { authenticateToken } = require("../middleware/authMiddleware")
const registrationRequestTemplate = require("../email/templates/registration-request") 
const passwordResetTemplate = require("../email/templates/password-reset")
const sendEmail = require("../email/email")

router.post("/login", userValidator.loginValidator, handleValidationResult, async (req, res, next) => {
	try {
		const user = await db("users").where("email", req.body.email).first()
		const error = "Failed to login: email, organization or password is incorrect."
		if (!user){
			res.status(400).json({errors: [error]})
			return
		}
		const userInOrganization = await db("organization_user_roles").where("organization_id", req.body.organization_id).where("user_id", user.id).first()
		if (!userInOrganization){
			res.status(400).json({errors: [error]})
			return
		}
		const storedHash = user.password
		const result = await bcrypt.compare(req.body.password, storedHash)
		if (!result){
			res.status(400).json({errors: [error]})
			return
		}
		const userRole = await db("user_roles").where("id", userInOrganization.user_role_id).first()
		if (!userRole){
			res.status(400).json({errors: [error]})
			return
		}
		const token = jwt.sign({"id": user.id, "email": user.email, "organization": req.body.organization_id, "userRole": userRole.name}, process.env.SECRET_KEY, {expiresIn: "1d"})
		res.json({message: "user logged in successfully!", token: token})
	}
	catch (err){
		console.error(`Something went wrong when logging in: ${err}`)
	}
})

router.post("/register", userValidator.registerValidator, handleValidationResult, async (req, res, next) => {
	try {
		const salt = await bcrypt.genSalt(config.saltRounds)
		const hash = await bcrypt.hash(req.body.password, salt)
		const user = await db("users").insert({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email,
			password: hash
		}, ["id"])
		await db("user_registration_requests").insert({
			user_id: user[0],
			organization_id: req.body.organization_id
		})

		// insert all notification types by default for a user
		const notificationTypes = await db("notification_types")
		const userToNotificationTypes = notificationTypes.map((notification) => ({user_id: user[0], notification_type_id: notification.id}))	
		await db("users_to_notification_types").insert(userToNotificationTypes)

		const organization = await db("organizations").where("id", req.body.organization_id).first()

		// TODO: send this to an async queue so the request isn't held up by email sending
		// send email to registered user
	    await sendEmail(req.body.email, "Registration Request Submitted", () => registrationRequestTemplate(req.body.first_name, req.body.last_name, organization?.name ?? ""));

		res.json({message: "User registered successfully!"})
	}
	catch (err){
		console.error(`Something went wrong when registering user: ${err}`)
	}
})

router.post("/forgot-password", userValidator.forgotPasswordValidator, handleValidationResult, async (req, res, next) => {
	try {
		const email = req.body.email
		// get user
		const user = await db("users").where("email", email).first()
		if (!user) return res.status(422).json({ message: "User not found" });

		// Generate a secure reset token
		const resetToken = crypto.randomBytes(32).toString("hex");
		// Expires in 15 minutes
		const expiresAt = new Date(Date.now() + 1000 * 60 * 15)
		// Store in the database
		await db("users").where("email", email).update({
		    reset_token: resetToken,
		    reset_token_expires: expiresAt,
		})
		// Generate reset link
		const resetLink = `/reset-password?token=${resetToken}`;

		// Send email
		await sendEmail(email, "Password Reset", () => passwordResetTemplate(user.first_name, user.last_name, resetLink));

		res.json({ message: "Password reset email sent" });

	}	
	catch (err){
		console.error(`Something went wrong when generating forgot password link: ${err}`)
	}
})

router.get("/validate-reset-token", async (req, res, next) => {
	try {
		// make sure the reset password token has not exceeded the current date and time
		const user = await db("users")
		.where("reset_token", req.query.token)
		.andWhere("reset_token_expires", ">", new Date())
		.first();
		if (!user) return res.status(422).json({message: "Invalid or expired token"})
		return res.json({token: user.token})
	}	
	catch (err){
		console.error(`Something went wrong when validating reset token: ${err}`)
	}
})

router.post("/reset-password", userValidator.resetPasswordValidator, handleValidationResult, async (req, res, next) => {
	try {
		const { token, password } = req.body
		
		// make sure the reset password token has not exceeded the current date and time
		const user = await db("users")
		.where("reset_token", token)
		.andWhere("reset_token_expires", ">", new Date())
		.first();

		if (!user) return res.status(400).json({ message: "Invalid or expired token" });

		// Hash new password
		const salt = await bcrypt.genSalt(config.saltRounds)
		const hash = await bcrypt.hash(password, salt)

		// Update user password and remove reset token
		await db("users").where("id", user.id).update({
			password: hash, 
			reset_token: null,
			reset_token_expires: null,
		});

		res.json({ message: "Password reset successful" });	
	}	
	catch (err){
		console.error(`Something went wrong when resetting password: ${err}`)
	}
})

router.post("/register/organization", userValidator.organizationUserRegisterValidator, handleValidationResult, async (req, res, next) => {
	try {
		const { first_name, last_name, password, email: user_email } = req.body.user
		const { name, address, city, state, zipcode, industry, phone_number, email} = req.body.organization
		const salt = await bcrypt.genSalt(config.saltRounds)
		const hash = await bcrypt.hash(password, salt)
		const user = await db("users").insert({
			first_name: first_name,
			last_name: last_name,
			email: user_email,
			password: hash
		}, ["id"])
		const organization = await db("organizations").insert({
			name, email, phone_number, address, city, state, zipcode, industry	
		}, ["id"])
		// create the admin user role for the new user
		const adminUserRole = await db("user_roles").where("name", "ADMIN").first()
		await db("organization_user_roles").insert({
			user_id: user[0],
			organization_id: organization[0],
			user_role_id: adminUserRole?.id
		})
		// attach default statuses for the new organization
		await db("statuses").insert(DEFAULT_STATUSES.map((status) => ({...status, organization_id: organization[0]})))

		res.json({message: "Organization and User registered successfully!"})
	}	
	catch (err){
		console.error(`Something went wrong when registering organization and user: ${err}`)
	}
})

router.post("/org-login", authenticateToken, async (req, res, next) => {
	try {
		const user = req.user
		const userInOrganization = await db("organization_user_roles").where("organization_id", req.body.organization_id).where("user_id", user.id).first()
		if (!userInOrganization){
			res.status(400).json({errors: [error]})
			return
		}
		const userRole = await db("user_roles").where("id", userInOrganization.user_role_id).first()
		if (!userRole){
			res.status(400).json({errors: [error]})
			return
		}
		const token = jwt.sign({"id": user.id, "email": user.email, "organization": req.body.organization_id, "userRole": userRole.name}, process.env.SECRET_KEY, {expiresIn: "1d"})
		res.json({message: "user switched organizations successfully!", token: token})
	}	
	catch (err) {
		console.error(`Something went wrong while switching organizations: ${err}`)
	}
})

module.exports = router
