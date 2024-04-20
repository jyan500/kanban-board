const db = require("../db/db")
const bcrypt = require("bcrypt")
const config = require("../config")
const jwt = require("jsonwebtoken")

/* 
Create user if doesn't exist, and return id
*/
const createUser = async (firstName, lastName, email, password) => {
	const salt = await bcrypt.genSalt(config.saltRounds)
	const hash = await bcrypt.hash(password, salt)
	const existing = await db("users").where("email", email).first()
	let id = [-1];
	if (!existing){
		id = await db("users").insert({
			first_name: firstName,	
			last_name: lastName,
			email: email,
			password: hash,
		}, ["id"])
	}
	return id[0]
}

// add existing user to the organization with their user role
const createOrganizationUserRole = async (
	userId, 
	organizationId, 
	userRoleId
) => {
	return await db("organization_user_roles").insert({
		user_id: userId,
		organization_id: organizationId,
		user_role_id: userRoleId
	}, ["id"])[0]
}

// Create a test token for the given user
const createUserTestToken = async (
	userId, 
	email, 
	organizationId, 
	userRoleName
) => {
	return await jwt.sign({"id": userId, "email": email, "organization": organizationId, "userRole": userRoleName}, process.env.SECRET_KEY, {expiresIn: "1d"})
}

module.exports = {
	createUser,
	createOrganizationUserRole,
	createUserTestToken
}
