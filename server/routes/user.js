require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const router = express.Router()
const config = require("../config")
const db = require("../db/db")
const userValidator = require("../validation/user")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const { body, validationResult } = require("express-validator")
const { insertAndGetId } = require("../helpers/functions")
const { authenticateToken } = require("../middleware/authMiddleware")
const registrationRequestTemplate = require("../email/templates/registration-request") 
const activateAccountTemplate = require("../email/templates/activate-account")
const passwordResetTemplate = require("../email/templates/password-reset")
const {sendEmail} = require("../email/email")
const { EXCEEDED_MESSAGE, DEFAULT_STATUSES } = require("../constants")
const axios = require("axios")
const { rateLimitAuth } = require("../middleware/rateLimitMiddleware")
const HistoryService = require('../services/history-service')

const historyService = new HistoryService(db)

router.post("/login", rateLimitAuth, userValidator.loginValidator, handleValidationResult, async (req, res, next) => {
	try {
		const user = await db("users").where("email", req.body.email).first()
		const error = "Failed to login: email, organization or password is incorrect."
		if (!user){
			res.status(400).json({errors: [error]})
			return
		}
		const storedHash = user.password
		const result = await bcrypt.compare(req.body.password, storedHash)
		if (!result){
			res.status(400).json({errors: [error]})
			return
		}
		const registrationRequest = await db("user_registration_requests").where("user_id", user.id).where("organization_id", req.body.organization_id).first()
		const userInOrganization = await db("organization_user_roles").where("organization_id", req.body.organization_id).where("user_id", user.id).first()
		// if the user has not been added to the organization, but they have a registration request,
		// allow them to login to a different portal with a "is_temp" token
		if (registrationRequest && !userInOrganization){
			const token = jwt.sign({"is_temp": true, "id": user.id, "email": user.email, "organization": 0, "userRole": ""}, process.env.SECRET_KEY, {expiresIn: "1d"})
			res.json({message: "user logged in successfully!", token: token, isTemp: true})
			return
		}
		else if (!userInOrganization){
			res.status(400).json({errors: ["Failed to login: your account has not been approved by this organization"]})
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
		next(err)
	}
})

router.post("/register", rateLimitAuth, userValidator.registerValidator, handleValidationResult, async (req, res, next) => {
	try {
		const { recaptcha } = req.body
		const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
			params: {
				secret: process.env.RECAPTCHA_SECRET_KEY,
				response: recaptcha
			}
		});

		if (!response.data.success) {
			return res.status(500).json({errors: ["Failed reCAPTCHA validation"]});
		}

		const salt = await bcrypt.genSalt(config.saltRounds)
		const hash = await bcrypt.hash(req.body.password, salt)

		const userId = await historyService.insert(
			'users',
			{  
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				email: req.body.email,
				password: hash,
				is_active: true,
			},
			req.historyContext
		)

		await db("user_registration_requests").insert({
			user_id: userId,
			organization_id: req.body.organization_id
		})

		// insert all notification types by default for a user
		const notificationTypes = await db("notification_types")
		const userToNotificationTypes = notificationTypes.map((notification) => ({user_id: userId, notification_type_id: notification.id}))	
		await db("users_to_notification_types").insert(userToNotificationTypes)

		const organization = await db("organizations").where("id", req.body.organization_id).first()

		// TODO: send this to an async queue so the request isn't held up by email sending
		// send email to registered user
	    await sendEmail(req.body.email, "Registration Request Submitted", () => registrationRequestTemplate(req.body.first_name, req.body.last_name, organization?.name ?? ""));

		res.json({message: "User registered successfully!"})
	}
	catch (err){
		console.error(`Something went wrong when registering user: ${err}`)
		next(err)
	}
})

router.post("/forgot-password", rateLimitAuth, userValidator.forgotPasswordValidator, handleValidationResult, async (req, res, next) => {
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
		await historyService.update(
			"users", 
			user.id, 
			{
			    reset_token: resetToken,
			    reset_token_expires: expiresAt,
			},
			req.historyContext
		)
		// Generate reset link
		const resetLink = `/reset-password?token=${resetToken}`;

		// Send email
		await sendEmail(email, "Password Reset", () => passwordResetTemplate(user.first_name, user.last_name, resetLink));

		res.json({ message: "Password reset email sent" });

	}	
	catch (err){
		console.error(`Something went wrong when generating forgot password link: ${err}`)
		next(err)
	}
})

router.get("/validate-token", rateLimitAuth, async (req, res, next) => {
	try {
		// make sure the reset password token has not exceeded the current date and time
		const user = await db("users")
		.modify((queryBuilder) => {
			if (req.query.type === "reset"){
				queryBuilder.where("reset_token", req.query.token)
				.andWhere("reset_token_expires", ">", new Date())
			}
			if (req.query.type === "activate"){
				queryBuilder.where("activation_token", req.query.token)
				.andWhere("activation_token_expires", ">", new Date())
			}
		})
		.first();
		if (!user) return res.status(422).json({message: "Invalid or expired token"})
		return res.json({token: user.token})
	}	
	catch (err){
		console.error(`Something went wrong when validating reset token: ${err}`)
		next(err)
	}
})

router.post("/resend-activation", rateLimitAuth, async (req, res, next) => {
	try {
		// if the user has a token but it's expired, allow for a resend
		const user = await db("users").where("activation_token", req.query.token).andWhere("activation_token_expires", ">", new Date()).first()
		if (!user){
			return res.status(400).json({message: "Invalid activation request"})	
		}
		// Generate activation link
	    const activationLink = `/activate?token=${activationToken}`;

	    // Send activation email
		await sendEmail(email, "Activate Your Account", () => activateAccountTemplate(user.first_name, user.last_name, activationLink));
		res.json({message: "Activation resent successfully!"})
	}	
	catch (err){
		console.error(`Something went wrong when resending activation: ${err}`)
		next(err)
	}
})

router.post("/activate", rateLimitAuth, async (req, res, next) => {
	try {
		const user = await db("users").where("activation_token", req.body.token).andWhere("activation_token_expires", ">", new Date()).first()
		if (!user) {
			return res.status(400).json({message: "Invalid activation request"})	
		}
		await historyService.update(
			"users",
			user.id,
			{
				is_active: true,
				activation_token: undefined,
				activation_token_expires: undefined,
			},
			req.historyContext
		)
		res.json({message: "Account activated successfully!"})
	}
	catch (err) {
		console.error(`Something went wrong when activating account: ${err}`)
		next(err)
	}
})

router.post("/reset-password", rateLimitAuth, userValidator.resetPasswordValidator, handleValidationResult, async (req, res, next) => {
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
		await historyService.update(
			"users",
			user.id,
			{
				password: hash, 
				reset_token: null,
				reset_token_expires: null,
			},
			req.historyContext
		);

		res.json({ message: "Password reset successful" });	
	}	
	catch (err){
		console.error(`Something went wrong when resetting password: ${err}`)
		next(err)
	}
})

router.post("/register/organization", rateLimitAuth, userValidator.organizationUserRegisterValidator, handleValidationResult, async (req, res, next) => {
	try {
		const { recaptcha } = req.body.user
		const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
			params: {
				secret: process.env.RECAPTCHA_SECRET_KEY,
				response: recaptcha
			}
		});

		if (!response.data.success) {
			return res.status(500).json({errors: ["Failed reCAPTCHA validation"]});
		}

		const { first_name, last_name, password, email: user_email } = req.body.user
		const { name, address, city, state, zipcode, industry, phone_number, email} = req.body.organization
		const salt = await bcrypt.genSalt(config.saltRounds)
		const hash = await bcrypt.hash(password, salt)

		// Generate a hashed activation token
	    const activationToken = crypto.randomBytes(32).toString("hex");

		const expiresAt = new Date();
		expiresAt.setMonth(expiresAt.getMonth() + 6);

		const userId = await historyService.insert(
			"users",
			{
			first_name: first_name,
			last_name: last_name,
			email: user_email,
			password: hash,
			activation_token: activationToken,
			activation_token_expires: expiresAt,
			is_active: false
			},
			req.historyContext
		)
		const organizationId = await insertAndGetId("organizations", {
			name, email, phone_number, address, city, state, zipcode, industry	
		})
		// create the admin user role for the new user
		const adminUserRole = await db("user_roles").where("name", "ADMIN").first()
		await db("organization_user_roles").insert({
			user_id: userId,
			organization_id: organizationId,
			user_role_id: adminUserRole?.id
		})
		// attach default statuses for the new organization
		await db("statuses").insert(DEFAULT_STATUSES.map((status) => ({...status, organization_id: organizationId})))

		// insert all notification types by default for a user
		const notificationTypes = await db("notification_types")
		const userToNotificationTypes = notificationTypes.map((notification) => ({user_id: userId, notification_type_id: notification.id}))	
		await db("users_to_notification_types").insert(userToNotificationTypes)

		// Generate activation link
	    const activationLink = `/activate?token=${activationToken}`;

	    // Send activation email
		await sendEmail(user_email, "Activate Your Account", () => activateAccountTemplate(first_name, last_name, activationLink));

		res.json({message: "Organization and User registered successfully!"})
	}	
	catch (err){
		console.error(`Something went wrong when registering organization and user: ${err}`)
		next(err)
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
		next(err)
	}
})

module.exports = router
