require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const router = express.Router()
const helper = require("../helper")
const config = require("../config")
const db = require("../db/db")
const userValidator = require("../validation/user")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const { body, validationResult } = require("express-validator")

router.post("/login", userValidator.loginValidator, handleValidationResult, async (req, res, next) => {
	try {
		const user = await db("users").where("email", req.body.email).first()
		const error = "Failed to login, email, organization or password is incorrect."
		if (!user){
			res.status(400).json({errors: [error]})
			return
		}
		const userInOrganization = await db("organization_user_roles").where("organization_id", req.body.organizationId).where("user_id", user.id).first()
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
		const token = jwt.sign({"id": user.id, "email": user.email, "organization": req.body.organizationId, "userRole": userRole.name}, process.env.SECRET_KEY, {expiresIn: "1h"})
		res.json({message: "user logged in successfully!", token: token})
	}
	catch (err){
		console.error(`Something went wrong when logging in: ${err}`)
	}
})

router.post("/register", userValidator.registerValidator, handleValidationResult, async (req, res, next) => {
	try {
		const salt = await bcrypt.genSalt(config.saltRounds)
		const hash = await bcrypt.hash(password, salt)
		await db("users").insert({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email,
			password: hash
		})
		res.json({message: "User registered successfully!"})
	}
	catch (err){
		console.error(`Something went wrong when registering user: ${err}`)
	}
})

module.exports = router
