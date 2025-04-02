require("dotenv").config()
const express = require("express")
const cors = require("cors")
const app = express()
const port = process.env.PORT || 8000;
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
const { asyncHandler } = require("./helpers/functions")

const api = (route, apiVersion = "") => {
	return `/api${apiVersion}/${route}`
}

// JSON parser middleware
app.use(express.json())
app.use(cors())

// Enable trust proxy
app.set('trust proxy', 1);

app.use(
	express.urlencoded({
		extended: true	
	})
)

/* Protected Endpoints */
app.use(api("status"), auth.authenticateApprovedToken, statusRouter)
app.use(api("priority"), auth.authenticateApprovedToken, priorityRouter)
app.use(api("board"), auth.authenticateApprovedToken, asyncHandler(authenticateUserActivated), boardRouter)
app.use(api("ticket"), auth.authenticateApprovedToken, asyncHandler(authenticateUserActivated), ticketRouter)
app.use(api("ticket-type"), auth.authenticateApprovedToken, ticketTypeRouter)
app.use(api("ticket-relationship-type"), auth.authenticateApprovedToken, ticketRelationshipTypeRouter)
app.use(api("user-profile"), auth.authenticateToken, userProfileRouter)
app.use(api("user-role"), auth.authenticateApprovedToken, userRoleRouter)
app.use(api("notification"), auth.authenticateApprovedToken, notificationRouter)
app.use(api("notification-type"), auth.authenticateApprovedToken, notificationTypeRouter)
app.use(api("group-by"), auth.authenticateApprovedToken, asyncHandler(authenticateUserActivated), groupByRouter)

/* Partially Protected Endpoints */
app.use(api("user"), userRouter)
app.use(api("organization"), organizationRouter)

app.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500
	console.error(err.message, err.stack)
	res.status(statusCode).json({errors: ["Something went wrong!"]})
	return
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})

module.exports = app