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

export interface LoadingStatus {
	id: number | string
	isLoading: boolean
}

export interface UserProfile {
	id: number
	firstName: string
	lastName: string
	email: string
	organizationId: number
	userRoleId: number
	isActive?: boolean
	organizationName?: string
	imageUrl?: string
}

export interface UserNotificationType {
	id: number
	notificationTypeId: number
	userId: number
}

export type RegistrationRequestStatus = "Pending" | "Approved" | "Denied"

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
	status?: string
	organizationName?: string
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
	description?: string
	userId?: number
	organizationId: number
	lastModified?: Date
	assignees?: Array<number>
	minutesSpent?: number
	percentComplete?: number
}

export interface BoardSummary {
	totalTickets: number
	ticketsByAssignee: Array<{userId: number, totalTickets: number}>
	ticketsByPriority: Array<{priorityId: number, totalTickets: number}>
	ticketsByStatus: Array<{statusId: number, totalTickets: number}>
	ticketsByTicketType: Array<{ticketTypeId: number, totalTickets: number}>
	ticketsDue: Array<number>
	ticketsCreated: Array<number>
	ticketsUpdated: Array<number>
	ticketsCompleted: Array<number>
}

export interface Sprint {
	id: number
	name: string
	goal: string
	debrief?: string
	organizationId: number
	userId: number
	boardId: number
	startDate: Date | string
	endDate: Date | string
	isCompleted: boolean
	numCompletedTickets?: number
	numOpenTickets?: number
}

export interface Project {
	id: number
	name: string
	imageUrl?: string
	organizationId: number
	userId: number
	owner: Pick<UserProfile, "id" | "imageUrl" | "firstName" | "lastName">
	description?: string
	createdAt: Date
}

export interface Ticket {
	id: number 
	priorityId: number
	name: string
	description: string
	statusId: number
	ticketTypeId: number
	organizationId: number
	dueDate: Date | string
	storyPoints: number
	userId: number
	createdAt: Date
	hasRelationship?: boolean
	hasNonEpicRelationship?: boolean
	epicParentTickets?: Array<{id: number, name: string}>
	assignees?: Array<Pick<UserProfile, "id" | "firstName" | "lastName">>
	timeSpent?: number
}

export interface TicketComment {
	id: number
	comment: string	
	userId: number
	ticketId: number
	createdAt: Date
	user?: Omit<UserProfile, "organizationId" | "userRoleId">
}

export interface TicketActivity {
	id: number
	description: string
	minutesSpent: number
	userId: number
	ticketId: number
	createdAt: Date
	user?: Omit<UserProfile, "organizationId" | "userRoleId">
}

export type ProfileActivity = Pick<TicketComment, "id" | "user" | "createdAt" >

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

export interface UserBoardFilter {
	id: number
	boardFilterId: number
	name: string
	value: number | null
	order: number
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

export interface ProgressBarItem {
	name: string
	percentage: number
	[key: string]: any
}

export interface PieChartItem {
	name: string
	value: number
	color: string
	[key: string]: any
}

export type ViewMode = 'week' | 'month'

