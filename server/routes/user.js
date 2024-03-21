const express = require("express")
const bcrypt = require("bcrypt")
const router = express.Router()
const helper = require("../helper")
const config = require("../config")
const db = require("../db/db")
const userValidator = require("../validation/user")
const { body, validationResult } = require("express-validator")

router.post("/login", async (req, res, next) => {

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
			console.log("hash: ", hash)
			// await db("users").insert({
			// 	...req.body,
			// 	password: hash
			// })
			res.json({message: "User registered successfully!", data: "session token here"})
		}
		catch (err){
			console.error(`Something went wrong when registering user: ${err}`)
		}
	}
})

router.post("/logout", async (req, res, next) => {

})

module.exports = router
