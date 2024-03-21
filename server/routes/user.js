require("dotenv").config()
const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const router = express.Router()
const helper = require("../helper")
const config = require("../config")
const db = require("../db/db")
const userValidator = require("../validation/user")
const { body, validationResult } = require("express-validator")

router.post("/login", userValidator.loginValidator, async (req, res, next) => {
	try {
		const user = await db("users").where("email", req.body.email).first()
		if (user){
			const storedHash = user.password
			const result = bcrypt.compare(req.body.password, storedHash)
			if (result){
				const token = jwt.sign({"id": user.id, "email": user.email}, process.env.SECRET_KEY, {expiresIn: "1h"})
				res.json({message: "user logged in successfully!", data: token})
			}
			else {
				res.status(400).json({message: "Failed to login, email or password is incorrect."})
			}
		}
	}
	catch (err){
		console.error(`Something went wrong when logging in: ${err}`)
	}
})

router.post("/register", userValidator.registerValidator, async (req, res, next) => {
	const { first_name: firstName, last_name: lastName, email, password, confirm_password: confirmPassword } = req.body
	const validationErrors = validationResult(req)
	let errors = []
	if (!validationErrors.isEmpty()){
		Object.keys(validationErrors.mapped()).forEach(field => {
			errors.push(`${validationErrors.mapped()[field]["msg"]}`)
		})
		res.json({errors: errors})
	}
	else {
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
	}
})

router.post("/logout", async (req, res, next) => {

})

module.exports = router
