const db = require("../db/db")
const bcrypt = require("bcrypt")
const config = require("../config")
const jwt = require("jsonwebtoken")

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* 
generate a random password by
choosing from a list of alphanumeric and special chars, 
and choosing indices at random
*/
const generateRandomPassword = () => {
	var length = 8
    let options = [
    	"abcdefghijklmnopqrstuvwxyz",
	    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	    "0123456789",
	    "!@#$%^&*()_+`~[]{}|\\\';:,.?/"
    ]
    let retVal = ""
    for (let i = 0; i < options.length; ++i) {
        // pick two characters out of each option
        for (let j = 0; j < 2; ++j){
	        let char = options[i][getRandomInt(0, options[i].length-1)]
	        retVal += char
        }
    }
    return retVal;
}

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
	const orgUserRole = await db("organization_user_roles").insert({
		user_id: userId,
		organization_id: organizationId,
		user_role_id: userRoleId
	}, ["id"])
	return orgUserRole[0]
}

// create user with user level permissions
const createUserWithOrganization = async (
	firstName, 
	lastName, 
	email, 
	orgId=1, 
	userRoleId=1
) => {
	const randomPassword = generateRandomPassword()
	const userId = await createUser(firstName, lastName, email, generateRandomPassword())
	const organizationUserRole = await createOrganizationUserRole(userId, orgId, userRoleId)
	return userId
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

// Create a test user and return an authentication token for this user 
const createTokenForUserRole = async (
	firstName,
	lastName,
	email,
	password,
	userRoleConst,
	organization,
) => {
	const userId = await createUser(firstName, lastName, email, password)
	const userRole = await db("user_roles").where("name", userRoleConst).first()
	const org = await db("organizations").where("name", organization).first()
	await createOrganizationUserRole(userId, org.id, userRole.id)
	return await createUserTestToken(userId, email, org.id, userRole.id)
}

module.exports = {
	createUser,
	createOrganizationUserRole,
	createUserWithOrganization,
	createUserTestToken,
	createTokenForUserRole
}
