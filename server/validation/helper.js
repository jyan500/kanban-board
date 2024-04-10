const db = require("../db/db")
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

/* 
	For use in express validator 
	- for custom validators, return a promise that resolves true 
	if the specified key is not found in the respective table, essentially
	checking for uniqueness.
*/
const checkUniqueEntity = async (key, colName, colValue, tableName) => {
	return new Promise((resolve, reject) => {
		db(tableName).where(colName, colValue).then((res) => {
			if (res?.length > 0){
				reject(new Error(`${key} with id ${colValue} already exists`))
			}
			resolve(true)
		})
	})
}

module.exports = {
	checkUniqueEntity,
	entityInOrganization,
	validateKeyExists,
}