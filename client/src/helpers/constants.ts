
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
export const MAX_PAGES_BEFORE_COMPRESS = 13

export const defaultRows = 4

export const SELECT_Z_INDEX = "tw-z-0"

export const PRIMARY_MODAL_Z_INDEX = "tw-z-20"

export const DROPDOWN_Z_INDEX = "tw-z-30"

export const SECONDARY_MODAL_Z_INDEX = "tw-z-40" 

export const TOOLBAR_Z_INDEX = "tw-z-50"

export const HOVER_Z_INDEX = "tw-z-[999]"

export const TAG_TYPES = [
	"Organizations",
	"Tickets",
	"TicketComments",
	"TicketAssignees",
    "TicketSummary",
	"BoardTickets",
	"Statuses",
	"BoardStatuses",
	"Boards",
    "Projects",
    "ProjectBoards",
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
    "Sprints",
    "SprintTickets",
    "UserBoardFilters",
    "BoardFilters",
    "BoardSummary",
    "BoardActivity",
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

export const TICKET_TYPE_COLOR_MAP: {[key: string]: string} = {
    "Modification": "var(--bs-primary)",
    "Bug": "var(--bs-danger)",
    "Epic": "var(--bs-light-purple)",
    "Feature": "var(--bs-success)",
}

export const PRIORITY_COLOR_MAP: {[key: string]: string} = {
	"Low": "var(--bs-primary)",
	"Medium": "var(--bs-warning)",
	"High": "var(--bs-danger)"	
}

export const MOVE_OPEN_ITEM_OPTIONS = [
    {value: "NEW SPRINT", label: "New Sprint"},
    {value: "BACKLOG", label: "Backlog"},
]

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

export const US_STATES = [
    { label: "Alabama", value: "AL" },
    { label: "Alaska", value: "AK" },
    { label: "Arizona", value: "AZ" },
    { label: "Arkansas", value: "AR" },
    { label: "California", value: "CA" },
    { label: "Colorado", value: "CO" },
    { label: "Connecticut", value: "CT" },
    { label: "Delaware", value: "DE" },
    { label: "Florida", value: "FL" },
    { label: "Georgia", value: "GA" },
    { label: "Hawaii", value: "HI" },
    { label: "Idaho", value: "ID" },
    { label: "Illinois", value: "IL" },
    { label: "Indiana", value: "IN" },
    { label: "Iowa", value: "IA" },
    { label: "Kansas", value: "KS" },
    { label: "Kentucky", value: "KY" },
    { label: "Louisiana", value: "LA" },
    { label: "Maine", value: "ME" },
    { label: "Maryland", value: "MD" },
    { label: "Massachusetts", value: "MA" },
    { label: "Michigan", value: "MI" },
    { label: "Minnesota", value: "MN" },
    { label: "Mississippi", value: "MS" },
    { label: "Missouri", value: "MO" },
    { label: "Montana", value: "MT" },
    { label: "Nebraska", value: "NE" },
    { label: "Nevada", value: "NV" },
    { label: "New Hampshire", value: "NH" },
    { label: "New Jersey", value: "NJ" },
    { label: "New Mexico", value: "NM" },
    { label: "New York", value: "NY" },
    { label: "North Carolina", value: "NC" },
    { label: "North Dakota", value: "ND" },
    { label: "Ohio", value: "OH" },
    { label: "Oklahoma", value: "OK" },
    { label: "Oregon", value: "OR" },
    { label: "Pennsylvania", value: "PA" },
    { label: "Rhode Island", value: "RI" },
    { label: "South Carolina", value: "SC" },
    { label: "South Dakota", value: "SD" },
    { label: "Tennessee", value: "TN" },
    { label: "Texas", value: "TX" },
    { label: "Utah", value: "UT" },
    { label: "Vermont", value: "VT" },
    { label: "Virginia", value: "VA" },
    { label: "Washington", value: "WA" },
    { label: "West Virginia", value: "WV" },
    { label: "Wisconsin", value: "WI" },
    { label: "Wyoming", value: "WY" }
]

/* Common Tailwind CSS Classes */
export const FADE_ANIMATION = "tw-transition tw-duration-100 tw-ease-in-out"

export const AVATAR_SIZES: {[k: string]: string} = {
    "l": "tw-w-32 tw-h-32",
    "ml": "tw-w-16 tw-h-16",
    "m": "tw-w-10 tw-h-10",
    "s": "tw-w-6 tw-h-6",
}

export const AVATAR_FONT_SIZES: {[k: string]: string} = {
    "s": "tw-text-xs",
    "m": "tw-text-l",
    "ml": "tw-text-l",
    "l": "tw-text-xl",
}
