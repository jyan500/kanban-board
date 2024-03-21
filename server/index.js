require("dotenv").config()
const express = require("express")
const app = express()
const port = 3000
const statusRouter = require("./routes/status")
const priorityRouter = require("./routes/priority")
const ticketRouter = require("./routes/ticket")
const ticketTypeRouter = require("./routes/ticketType")
const userRouter = require("./routes/user")
const auth = require("./middleware/authMiddleware")

// JSON parser middleware
app.use(express.json())

app.use(
	express.urlencoded({
		extended: true	
	})
)

app.get("/", (req, res) => {
	res.json({message: "ok"})	
})

app.use("/status", auth.authenticateToken, statusRouter)
app.use("/priority", auth.authenticateToken, priorityRouter)
app.use("/ticket", auth.authenticateToken, ticketRouter)
app.use("/ticket-type", auth.authenticateToken, ticketTypeRouter)
app.use("/user", userRouter)

app.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500
	console.error(err.message, err.stack)
	res.status(statusCode).json({message: err.message})
	return
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})