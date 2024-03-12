const express = require("express")
const app = express()
const port = 3000
const mysql = require("mysql2")
const config = require("./config.js")

// JSON parser middleware
app.use(express.json())

app.use(
	express.urlencoded({
		extended: true	
	})
)

const connection = mysql.createConnection(config.db)

app.get("/", (req, res) => {
	connection.query("SELECT now()", function(error, rows) {
		if (error) throw error
		console.log(rows)
	})
	res.json({message: "ok"})	
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})