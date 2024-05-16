export const API_VERSION = "api"
export const BACKEND_BASE_URL = "http://localhost:8000"
export const LOGIN_URL = `/${API_VERSION}/user/login`
export const REGISTER_URL = `/${API_VERSION}/user/register`
export const ORGANIZATION_URL = `/${API_VERSION}/organization`
export const USER_PROFILE_URL = `/${API_VERSION}/user-profile`
export const TICKET_URL = `/${API_VERSION}/ticket`
export const BOARD_URL = `/${API_VERSION}/board`
export const STATUS_URL = `/${API_VERSION}/status`
export const TICKET_TYPE_URL = `/${API_VERSION}/ticket-type`
export const PRIORITY_URL = `/${API_VERSION}/priority`
export const BOARD_TICKET_URL = (boardId: number | string, ticketId: number | string) => `/${API_VERSION}/board/${boardId}/ticket` + (ticketId !== "" ? `/${ticketId}` : "")
export const BOARD_STATUS_URL = (boardId: number | string, statusId: number | string) => `/${API_VERSION}/board/${boardId}/status` + (statusId !== "" ? `/${statusId}` : "")
