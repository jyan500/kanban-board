import { TicketForm } from "../components/TicketForm"
import { StatusForm } from "../components/StatusForm" 


export const defaultStatuses = [
	{id: "1", name: "To-Do", order: 1}, 
	{id: "2", name: "In Progress", order: 2}, 
	{id: "3", name: "Code Complete", order: 3},
	{id: "4", name: "On Test", order: 4},
	{id: "5", name: "Staging", order: 5},
	{id: "6", name: "Released", order: 6},
	{id: "7", name: "Closed", order: 7},
]

export const defaultPriorities = [
	{id: "1", name: "High", order: 1},
	{id: "2", name: "Medium", order: 2},
	{id: "3", name: "Low", order: 3},
]

export const defaultStatusesToDisplay = [
	"1","2","3","4"
]

export const defaultRows = 4
