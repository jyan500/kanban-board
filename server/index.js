require("dotenv").config()
const express = require("express")
const cors = require("cors")
const app = express()
const port = 8000
const statusRouter = require("./routes/status")
const priorityRouter = require("./routes/priority")
const ticketRouter = require("./routes/ticket")
const boardRouter = require("./routes/board")
const organizationRouter = require("./routes/organization")
const ticketTypeRouter = require("./routes/ticketType")
const ticketRelationshipTypeRouter = require("./routes/ticketRelationshipType")
const userProfileRouter = require("./routes/userProfile")
const userRouter = require("./routes/user")
const userRoleRouter = require("./routes/userRole")
const notificationRouter = require("./routes/notification")
const notificationTypeRouter = require("./routes/notificationType")
const groupByRouter = require("./routes/groupBy")
const auth = require("./middleware/authMiddleware")
const {authenticateUserActivated} = require("./middleware/userActivatedMiddleware")

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
app.use(api("board"), auth.authenticateToken, authenticateUserActivated, boardRouter)
app.use(api("ticket"), auth.authenticateToken, authenticateUserActivated, ticketRouter)
app.use(api("ticket-type"), auth.authenticateToken, ticketTypeRouter)
app.use(api("ticket-relationship-type"), auth.authenticateToken, ticketRelationshipTypeRouter)
app.use(api("user-profile"), auth.authenticateToken, userProfileRouter)
app.use(api("user-role"), auth.authenticateToken, userRoleRouter)
app.use(api("notification"), auth.authenticateToken, authenticateUserActivated, notificationRouter)
app.use(api("notification-type"), auth.authenticateToken, notificationTypeRouter)
app.use(api("group-by"), auth.authenticateToken, authenticateUserActivated, groupByRouter)

/* Partially Protected Endpoints */
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

module.exports = app