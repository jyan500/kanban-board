/*
turns an object of the following from knex into an object where the key is the id of the row, mapped
to the rest of the row as an object, or a specific column

specifically for use in group by queries that return different results for the same id

[
	{
		id: 1,
		user_id: 1
	},
	{
		
		id: 1,
		user_id: 2
	}
]

to 

{
	1: [1, 2],	
}

OR if a specific row is mentioned (i.e "name")

to 

{
	1: "Test"
}

*/
const mapIdToRowAggregateArray = (dbObjArray, specificColumn) => {
	let obj = {}
	dbObjArray.map((row) => {
		if (!(row.id in obj)){
			obj[row.id] = []
		}
		if (specificColumn in row){
			obj[row.id].push(row[specificColumn])
		}
	})
	return obj
} 

/*  similar to mapIdToRowAggregateArray, but append object instead of a singular column*/
const mapIdToRowAggregateObjArray = (dbObjArray, additionalColumns) => {
	let obj = {}
	dbObjArray.map((row) => {
		if (!(row.id in obj)){
			obj[row.id] = []
		}
		let res = {}
		for (key of additionalColumns){
			res[key] = row[key]
		}
		obj[row.id].push(res)
	})
	return obj
} 

/* maps an id to its row */
const mapIdToRowObject = (dbObjArray) => {
	let obj = {}	
	dbObjArray.map((row) => {
		obj[row.id] = row
	})
	return obj
}

module.exports = {
	mapIdToRowObject,
	mapIdToRowAggregateArray,
	mapIdToRowAggregateObjArray
}