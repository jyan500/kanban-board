const BULK_INSERT_LIMIT = 500
const DEFAULT_STATUSES = [
	{name: "Selected For Dev", order: 1, is_active: true, is_completed: false},
	{name: "In Progress", order: 2, is_active: true, is_completed: false},
	{name: "Code Complete", order: 3, is_active: true, is_completed: false},
	{name: "On Test", order: 4, is_active: true, is_completed: false},
	{name: "Staging", order: 5, is_active: true, is_completed: false},
	{name: "Complete", order: 5, is_active: true, is_completed: true},
]

module.exports = {
	BULK_INSERT_LIMIT,
	DEFAULT_STATUSES
}
