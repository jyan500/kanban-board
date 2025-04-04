
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

export const MIN_COLUMN_LIMIT = 1
export const MAX_COLUMN_LIMIT = 50
export const MIN_BOARD_TICKET_LIMIT = 1
export const MAX_BOARD_TICKET_LIMIT = 1000

export const defaultRows = 4

export const SELECT_Z_INDEX = "tw-z-0"

export const PRIMARY_MODAL_Z_INDEX = "tw-z-20"

export const DROPDOWN_Z_INDEX = "tw-z-30"

export const SECONDARY_MODAL_Z_INDEX = "tw-z-40" 

export const TAG_TYPES = [
	"Organizations",
	"Tickets",
	"TicketComments",
	"TicketAssignees",
	"BoardTickets",
	"Statuses",
	"BoardStatuses",
	"Boards",
	"TicketTypes",
	"Priorities",
	"TicketRelationshipTypes",
	"TicketRelationships",
	"TicketActivity",
	"RegistrationRequests",
	"UserProfiles",
	"Notifications",
	"PollNotifications",
	"UserNotificationTypes",
	"UserOrganizations",
]

export const EMAIL_PATTERN = /\S+@\S+\.\S+/

/*
Matches the standard 10 digit phone:
18005551234
1 800 555 1234
+1 800 555-1234
+86 800 555 1234
1-800-555-1234
1 (800) 555-1234
(800)555-1234
(800) 555-1234
(800)5551234
800-555-1234
800.555.1234
800 555 1234x5678
8005551234 x5678
1    800    555-1234
1----800----555-1234
*/
// export const PHONE_PATTERN = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/
export const PHONE_PATTERN = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/
export const TIME_DISPLAY_FORMAT = /^(\d{2})w (\d{1})d (\d{2})h (\d{2})m$/

export const GROUP_BY_OPTIONS = {
	"NONE": "None",
	"ASSIGNEE": "Assignee",
	"TICKET_TYPE": "Ticket Type",
	"EPIC": "Epic",
	"PRIORITY": "Priority",
}

export const SM_BREAKPOINT = 640
export const MD_BREAKPOINT = 768
export const LG_BREAKPOINT = 1024
export const XL_BREAKPOINT = 1280
export const TWO_XL_BREAKPOINT = 1536

export const MINUTES_PER_WEEK = 10080
export const MINUTES_PER_DAY = 1440
export const MINUTES_PER_HOUR = 60
/* 
Note this was calculated like so 
(100 * 10080) - 1
this is 100 weeks converted to minutes, subtracted by one.
this represents the largest input possible according to the input mask
like so: 99w 6d 23h 59m
*/
export const MAX_MINUTES = 1007999 
export const TIME_DISPLAY_INPUT_MASK = "99w 9d 99h 99m"
export const TIME_DISPLAY_PLACEHOLDER = "ww d hh mm"

export const FADE_ANIMATION = "tw-transition tw-duration-100 tw-ease-in-out"

