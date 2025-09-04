const express = require("express")
const router = express.Router()
const {
	validateSprintGet,
    validateSprintGetById,
	validateSprintCreate,
	validateSprintUpdate,
	validateSprintDelete,
	validateSprintTicketGet,
    validateSprintTicketGetById,
	validateSprintTicketUpdate,
}  = require("../validation/sprint")
const { handleValidationResult }  = require("../middleware/validationMiddleware")
const { authenticateUserRole } = require("../middleware/userRoleMiddleware")

router.get("/", validateSprintGet, handleValidationResult, async (req, res, next) => {
	try {
		res.json({message: "GET /sprint endpoint"})
	}
	catch (err) {
		console.error(`Error while getting sprints: ${err.message}`)
		next(err)
	}
})

router.get("/:sprintId", validateSprintGetById, handleValidationResult, async (req, res, next) => {
	try {
		res.json({message: "GET /sprint/:sprintId endpoint"})
	}
	catch (err) {
		console.error(`Error while getting sprint: ${err.message}`)
		next(err)
	}
})

router.post("/", validateSprintCreate, handleValidationResult, async (req, res, next) => {
	try {
		res.json({message: "POST /sprint endpoint"})
	}
	catch (err) {
		console.error(`Error while creating sprint: ${err.message}`)
		next(err)
	}
})

router.put("/:sprintId", validateSprintUpdate, handleValidationResult, async (req, res, next) => {
	try {
		res.json({message: "PUT /sprint/:sprintId endpoint"})
	}
	catch (err) {
		console.error(`Error while updating sprint: ${err.message}`)
		next(err)
	}
})

router.get("/:sprintId/ticket", validateSprintTicketGet, handleValidationResult, async (req, res, next) => {
	try {
		res.json({message: "GET /:sprintId/ticket endpoint"})
	}
	catch (err) {
		console.error(`Error while getting sprint ticket: ${err.message}`)
		next(err)
	}
})

router.get("/:sprintId/ticket/:ticketId", validateSprintTicketGetById, handleValidationResult, async (req, res, next) => {
    try {
        res.json({message: "GET /:sprintId/ticket/:ticketId endpoint"})
    }
    catch (err){
        console.error(`Error while getting sprint ticket: ${err.message}`)
    }
})

router.post("/:sprintId/ticket", validateSprintTicketUpdate, handleValidationResult, async (req, res, next) => {
	try {
		res.json({message: "PUT /:sprintId/ticket endpoint"})
	}
	catch (err) {
		console.error(`Error while updating sprint ticket: ${err.message}`)
		next(err)
	}
})

router.delete("/:sprintId", validateSprintDelete, handleValidationResult, async (req, res, next) => {
	try {
		res.json({message: "DELETE /sprint/:sprintId endpoint"})
	}
	catch (err) {
		console.error(`Error while deleting sprint: ${err.message}`)
		next(err)
	}
})

module.exports = router
