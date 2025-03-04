require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const router = express.Router()
const config = require("../config")
const db = require("../db/db")
const { DEFAULT_STATUSES } = require("../constants")
const userValidator = require("../validation/user")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const { body, validationResult } = require("express-validator")
const { authenticateToken } = require("../middleware/authMiddleware")
const registrationRequestTemplate = require("../email/templates/registration-request") 
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
