export const API_VERSION = process.env.REACT_APP_API_VERSION
export const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL
// export const API_VERSION = "api"
// export const BACKEND_BASE_URL = "http://localhost:8000"
export const LOGIN_URL = `/${API_VERSION}/user/login`
export const FORGOT_PASSWORD_URL = `/${API_VERSION}/user/forgot-password`
export const RESET_PASSWORD_URL = `/${API_VERSION}/user/reset-password`
export const ACTIVATE_ACCOUNT_URL = `/${API_VERSION}/user/activate`
export const RESEND_ACTIVATION_URL = `/${API_VERSION}/user/resend-activation`
export const VALIDATE_TOKEN = `/${API_VERSION}/user/validate-token`
export const ORG_LOGIN_URL = `/${API_VERSION}/user/org-login`
export const REGISTER_URL = `/${API_VERSION}/user/register`
export const REGISTER_ORGANIZATION_USER_URL = `/${API_VERSION}/user/register/organization`
export const ORGANIZATION_URL = `/${API_VERSION}/organization`
export const USER_REGISTRATION_REQUEST_URL = `/${API_VERSION}/organization/registration-request`
export const USER_PROFILE_URL = `/${API_VERSION}/user-profile`
export const USER_PROFILE_ORG_URL = `${USER_PROFILE_URL}/organization`
export const USER_BOARD_FILTER_URL = `${USER_PROFILE_URL}/board-filter`
export const USER_NOTIFICATION_TYPES_URL = `${USER_PROFILE_URL}/notification-type`
export const USER_ACTIVATE_ACCOUNT = `${USER_PROFILE_URL}/activate`
export const USER_ROLE_URL = `/${API_VERSION}/user-role/`
export const TICKET_URL = `/${API_VERSION}/ticket`
export const BOARD_URL = `/${API_VERSION}/board`
export const PROJECT_URL = `/${API_VERSION}/project`
export const STATUS_URL = `/${API_VERSION}/status`
export const TICKET_TYPE_URL = `/${API_VERSION}/ticket-type`
export const PRIORITY_URL = `/${API_VERSION}/priority`
export const TICKET_RELATIONSHIP_TYPE_URL = `/${API_VERSION}/ticket-relationship-type`
export const NOTIFICATION_URL = `/${API_VERSION}/notification`
export const NOTIFICATION_TYPE_URL = `/${API_VERSION}/notification-type`
export const GROUP_BY_URL = `/${API_VERSION}/group-by`
export const SPRINT_URL = `/${API_VERSION}/sprint`
export const PROJECT_BOARD_URL = (projectId: number | string) => `/${API_VERSION}/project/${projectId}/board`
export const BOARD_TICKET_URL = (boardId: number | string, ticketId: number | string) => `/${API_VERSION}/board/${boardId}/ticket` + (ticketId !== "" ? `/${ticketId}` : "")
export const BOARD_PROJECT_URL = (boardId: number) => `/${API_VERSION}/board/${boardId}/project`
export const BOARD_STATUS_URL = (boardId: number | string, statusId: number | string) => `/${API_VERSION}/board/${boardId}/status` + (statusId !== "" ? `/${statusId}` : "")
export const BOARD_BULK_EDIT_STATUS_URL = (boardId: number | string) => `/${API_VERSION}/board/${boardId}/status/bulk-edit`
export const BOARD_FILTER_URL = (boardId: number | string) => `/${API_VERSION}/board/${boardId}/filter`
export const TICKET_ASSIGNEES_URL = (ticketId: number | string) => `/${API_VERSION}/ticket/${ticketId}/user/`
export const TICKET_SUMMARY_URL = (ticketId: number | string) => `/${API_VERSION}/ticket/${ticketId}/summary/`
export const TICKET_BULK_EDIT_ASSIGNEES_URL = (ticketId: number | string) => `/${API_VERSION}/ticket/${ticketId}/user/bulk-edit`
export const TICKET_ASSIGNEE_URL = (ticketId: number | string, userId: number | string) => `/${API_VERSION}/ticket/${ticketId}/user/${userId}`
export const TICKET_COMMENT_URL = (ticketId: number | string, commentId: number | string) => `/${API_VERSION}/ticket/${ticketId}/comment` + (commentId !== "" ? `/${commentId}` : "")
export const TICKET_STATUS_URL = (ticketId: number | string) => `/${API_VERSION}/ticket/${ticketId}/status`
export const TICKET_RELATIONSHIP_URL = (ticketId: number | string, relationshipId: number | string) => `/${API_VERSION}/ticket/${ticketId}/relationship` + (relationshipId !== "" ? `/${relationshipId}` : "")
export const TICKET_ACTIVITY_URL = (ticketId: number | string, activityId: number | string) => `/${API_VERSION}/ticket/${ticketId}/activity` + (activityId !== "" ? `/${activityId}` : "")
export const USER_PROFILE_REGISTRATION_REQUEST_URL = (userId: number | string) => `${API_VERSION}/user-profile/${userId}/registration-request`
