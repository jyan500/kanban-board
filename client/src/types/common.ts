export interface Priority {
	id: string
	name: string
	order: number
}

export interface Ticket {
	id: string
	priority: Priority
	ticketName: string
	ticketDescription: string
	ticketStatus: Status
}

export interface Cell {
	id: string 
	rowNum?: number
	colNum?: number
	ticket: Ticket | null
}

export interface Board {
	[statusId: string]: Array<Ticket>
}

export interface Status {
	id: string  
	name: string
	order: number
}
