function getOffset(currentPage = 1, listPerPage){
	return (currentPage - 1) * listPerPage
}

function emptyOrRows(rows) {
	if (!rows){
		return []
	}
	return rows
}

function validateKeys(body, keys, requiredKeys){
	const bodyKeys = Object.keys(body)
	let containsAllKeys = true
	let missingKeys = []
	let missingRequiredKeys = []
	keys.forEach(key => {
		if (!bodyKeys.includes(key)){
			containsAllKeys = false
			missingKeys.push(`${key} is a required field`)
		}
	})
	// contains all the specified keys
	if (!containsAllKeys){
		return {"result": false, errors: missingKeys}
	}
	// all required keys have values
	let containsAllRequired = true
	requiredKeys.forEach(key => {
		const value = body[key]	
		if (value == null || value === ""){
			containsAllRequired = false
			missingRequiredKeys.push(`${key} is a required field`)
		}
	})
	if (!containsAllRequired){
		return {"result": false, errors: missingRequiredKeys}
	}
	return {"result": true, errors: []}
}

module.exports = {
	getOffset,
	emptyOrRows,
	validateKeys
}