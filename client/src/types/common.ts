export interface UserProfile {
	id: number
	firstName: string
	lastName: string
	email: string
	organizationId: number
	userRoleId: number
}

export interface UserRole {
	id: number
	name: string
}

export interface Organization {
	id: number
	name: string
}

export interface Priority {
	id: number 
	name: string
	order: number
}

export interface Board {
	id: number
	name: string 
	organizationId: number
	lastModified?: Date
	assignees?: Array<number>
}

export interface TicketType {
	id: number
	name: string
}

export interface Ticket {
	id: number 
	priorityId: number
	name: string
	description: string
	statusId: number
	ticketTypeId: number
	organizationId: number
	userId: number
	createdAt: Date
	hasRelationship?: boolean
	epicParentTickets?: Array<{id: number, name: string}>
}

export interface TicketComment {
	id: number
	comment: string	
	userId: number
	ticketId: number
	createdAt: Date
}

export interface Cell {
	id: number 
	rowNum?: number
	colNum?: number
	ticket: Ticket | null
}

export interface KanbanBoard {
	[statusId: string]: Array<number>
}

export interface Status {
	id: number  
	name: string
	order: number
	organizationId: number
	isCompleted: boolean
}

export interface CustomError {
	data: Record<string, Array<string>>
	status: number
}

export interface Toast {
	id: string
	message: string
	type: "success" | "failure" | "warning"
	animationType: string
}

export interface TicketRelationship {
	id: number
	parentTicketId: number
	childTicketId: number
	ticketRelationshipTypeId: number
}

export interface TicketRelationshipType {
	id: number
	name: string
}

export interface IPagination {
	total?: number;
	lastPage?: number;
	prevPage?: number
	nextPage?: number
	currentPage: number;
	perPage: number;
	from: number;
	to: number;
}

export interface ListResponse<T> {
	pagination: IPagination
	data: Array<T>
	additional?: Record<string, any>
}

export interface OptionType {
	label: string
	value: string
}

export interface ProgressBarPercentage {
	className: string
	value: number
	label: string
}
