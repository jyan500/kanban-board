export const API_VERSION = "api"
export const BACKEND_BASE_URL = "http://localhost:8000"
export const LOGIN_URL = `/${API_VERSION}/user/login`
export const ORG_LOGIN_URL = `/${API_VERSION}/user/org-login`
export const REGISTER_URL = `/${API_VERSION}/user/register`
export const ORGANIZATION_URL = `/${API_VERSION}/organization`
export const USER_REGISTRATION_REQUEST_URL = `/${API_VERSION}/organization/registration-request`
export const USER_PROFILE_URL = `/${API_VERSION}/user-profile`
export const USER_PROFILE_ORG_URL = `${USER_PROFILE_URL}/organization`
export const USER_ROLE_URL = `/${API_VERSION}/user-role/`
export const TICKET_URL = `/${API_VERSION}/ticket`
export const BOARD_URL = `/${API_VERSION}/board`
export const STATUS_URL = `/${API_VERSION}/status`
export const TICKET_TYPE_URL = `/${API_VERSION}/ticket-type`
export const PRIORITY_URL = `/${API_VERSION}/priority`
export const TICKET_RELATIONSHIP_TYPE_URL = `/${API_VERSION}/ticket-relationship-type`
export const BOARD_TICKET_URL = (boardId: number | string, ticketId: number | string) => `/${API_VERSION}/board/${boardId}/ticket` + (ticketId !== "" ? `/${ticketId}` : "")
export const BOARD_STATUS_URL = (boardId: number | string, statusId: number | string) => `/${API_VERSION}/board/${boardId}/status` + (statusId !== "" ? `/${statusId}` : "")
export const BOARD_BULK_EDIT_STATUS_URL = (boardId: number | string) => `/${API_VERSION}/board/${boardId}/status/bulk-edit`
export const TICKET_ASSIGNEES_URL = (ticketId: number | string) => `/${API_VERSION}/ticket/${ticketId}/user/`
export const TICKET_BULK_EDIT_ASSIGNEES_URL = (ticketId: number | string) => `/${API_VERSION}/ticket/${ticketId}/user/bulk-edit`
export const TICKET_ASSIGNEE_URL = (ticketId: number | string, userId: number | string) => `/${API_VERSION}/ticket/${ticketId}/user/${userId}`
export const TICKET_COMMENT_URL = (ticketId: number | string, commentId: number | string) => `/${API_VERSION}/ticket/${ticketId}/comment` + (commentId !== "" ? `/${commentId}` : "")
export const TICKET_STATUS_URL = (ticketId: number | string) => `/${API_VERSION}/ticket/${ticketId}/status`
export const TICKET_RELATIONSHIP_URL = (ticketId: number | string, relationshipId: number | string) => `/${API_VERSION}/ticket/${ticketId}/relationship` + (relationshipId !== "" ? `/${relationshipId}` : "")
