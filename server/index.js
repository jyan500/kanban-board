require("dotenv").config()
const express = require("express")
const cors = require("cors")
const app = express()
const port = 8000
const statusRouter = require("./routes/status")
const priorityRouter = require("./routes/priority")
const ticketRouter = require("./routes/ticket")
const organizationRouter = require("./routes/organization")
const ticketTypeRouter = require("./routes/ticketType")
const userProfileRouter = require("./routes/userProfile")
const userRouter = require("./routes/user")
const auth = require("./middleware/authMiddleware")


const api = (route, apiVersion = "") => {
	return `/api${apiVersion}/${route}`
}

// JSON parser middleware
app.use(express.json())
app.use(cors())

app.use(
	express.urlencoded({
		extended: true	
	})
)

/* Protected Endpoints */
app.use(api("status"), auth.authenticateToken, statusRouter)
app.use(api("priority"), auth.authenticateToken, priorityRouter)
app.use(api("ticket"), auth.authenticateToken, ticketRouter)
app.use(api("ticket-type"), auth.authenticateToken, ticketTypeRouter)
app.use(api("user-profile"), auth.authenticateToken, userProfileRouter)

/* Public Endpoints */
app.use(api("user"), userRouter)
app.use(api("organization"), organizationRouter)

app.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500
	console.error(err.message, err.stack)
	res.status(statusCode).json({message: err.message})
	return
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})