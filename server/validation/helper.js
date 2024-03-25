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

module.exports = {
	validateKeyExists
}