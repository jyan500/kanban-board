export const API_VERSION = "api"
export const BACKEND_BASE_URL = "http://localhost:8000"
export const LOGIN_URL = `/${API_VERSION}/user/login`
export const REGISTER_URL = `/${API_VERSION}/user/register`
export const ORGANIZATION_URL = `/${API_VERSION}/organization`
export const USER_PROFILE_URL = `/${API_VERSION}/user-profile`
export const TICKET_URL = `/${API_VERSION}/ticket`
export const BOARD_URL = `/${API_VERSION}/board`
export const BOARD_TICKET_URL = (boardId: string, ticketId = "") => `/${API_VERSION}/board/${boardId}/ticket/${ticketId}`
