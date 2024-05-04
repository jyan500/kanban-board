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
	id: string
	name: string
	order: number
}

export interface Board {
	id: number
	name: string 
	organization: Organization
}

export interface Ticket {
	id: string
	priority: Priority
	name: string
	description: string
	status: Status
	ticketType: string
}

export interface Cell {
	id: string 
	rowNum?: number
	colNum?: number
	ticket: Ticket | null
}

export interface KanbanBoard {
	[statusId: string]: Array<Ticket>
}

export interface Status {
	id: string  
	name: string
	order: number
}

export interface CustomError {
	data: Record<string, Array<string>>
	status: number
}