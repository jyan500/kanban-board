import { GROUP_BY_OPTIONS } from "../helpers/constants"

export interface ObjectType {
	id: number
	name: string
}

export interface GenericObject {
	id: number
	name: string
	[property: string]: any
}

export interface OptionType {
	value: string
	label: string
}

export interface UserProfile {
	id: number
	firstName: string
	lastName: string
	email: string
	organizationId: number
	userRoleId: number
	organizationName?: string
	imageUrl?: string
}

export interface UserNotificationType {
	id: number
	notificationTypeId: number
	userId: number
}

export type UserRole = ObjectType
export type NotificationType = ObjectType & { template: string }
export type TicketType = ObjectType
export type TicketRelationshipType = ObjectType

export interface UserRegistrationRequest {
	id: number	
	userId: number
	organizationId: number
	approvedAt?: Date
	deniedAt?: Date
	createdAt: Date
	user?: Omit<UserProfile, "organizationId" | "userRoleId">
}

export interface Organization {
	id: number
	name: string
	phoneNumber?: string
	email?: string
	address?: string
	state?: string
	city?: string
	industry?: string
	zipcode?: string
	imageUrl?: string
}

export interface Priority {
	id: number 
	name: string
	order: number
}

export interface Board {
	id: number
	name: string 
	ticketLimit: number
	organizationId: number
	lastModified?: Date
	assignees?: Array<number>
}

export interface Ticket {
	id: number 
	priorityId: number
	name: string
	description: string
	statusId: number
	ticketTypeId: number
	organizationId: number
	dueDate: Date | null
	minutesSpent: number
	storyPoints: number
	userId: number
	createdAt: Date
	hasRelationship?: boolean
	epicParentTickets?: Array<{id: number, name: string}>
	assignees?: Array<number>
}

export interface TicketComment {
	id: number
	comment: string	
	userId: number
	ticketId: number
	createdAt: Date
	user?: Omit<UserProfile, "organizationId" | "userRoleId">
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
	isActive: boolean
	isCompleted: boolean
	limit?: number
}

export interface CustomError {
	data: Record<string, Array<string>>
	status: number
}

/* UNUSED, since this project sticks to CustomError, but necessary to avoid typescript error */
export interface SerializedError {
	name?: string
	message?: string
	stack?: string
	code?: string
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

export interface ProgressBarPercentage {
	className: string
	value: number
	label: string
}

export interface Notification {
	id: number	
	body: string
	notificationTypeId: number
	objectLink: string
	isRead: boolean
	ticketId?: number
	recipientId: number
	senderId: number
	createdAt: Date
}

export interface Mention {
    userId: number;
    [key: string]: any;
}

export type GroupByOptionsKey = keyof typeof GROUP_BY_OPTIONS

export type GroupedTickets = {
	[groupByIdString: string]: {[statusId: string]: Array<number>}
}

export type GroupByElement = {
	id: number
	name: string
	[property: string]: any
}

