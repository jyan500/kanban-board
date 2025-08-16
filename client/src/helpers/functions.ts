import type { KanbanBoard, Cell, Status, Toast, Ticket, Priority, UserProfile } from "../types/common"
import { v4 as uuidv4 } from "uuid"
import { AppDispatch } from "../store"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks" 
import { LG_BREAKPOINT, MAX_MINUTES, TIME_DISPLAY_FORMAT, MINUTES_PER_WEEK, MINUTES_PER_DAY, MINUTES_PER_HOUR } from "./constants"
/* 

New Design:
Map each status id to an array, which represents all tickets for this column
*/
export const setupInitialBoard = (statuses: Array<Status>, numRows: number) => {
	let board: KanbanBoard = {}
	for (let i = 0; i < statuses.length; ++i){
		board[statuses[i].id] = []
	}
	return board
}

/*
returns board that has each column of tickets sorted by priority
*/
export const prioritySort = (
	board: KanbanBoard, 
	tickets: Array<Ticket>, 
	priorities: Array<Priority>, 
	sortOrder: 1 | -1, 
	statusId: number | undefined) => {
	let tempBoard = {...board}
	if (statusId){
		const ticketIdArray = board[statusId]
		const ticketAndPriorities = ticketIdArray.map((ticketId) => {
			const ticket = tickets.find((ticket: Ticket)=>ticket.id === ticketId)
			if (ticket){
				const priority = priorities.find((priority: Priority) => priority.id === ticket.priorityId)
				if (priority){
					return {priorityOrder: priority.order, id: ticketId, name: ticket.name}	
				}
			}
			return {priorityOrder: 0, id: 0, name: ""}	
		})
		const sortedTicketAndPriorities = prioritySortHelper(ticketAndPriorities.filter((obj) => obj.id !== 0))
		const sortedTicketIds = sortedTicketAndPriorities.map((obj) => obj.id)
		tempBoard = {...tempBoard, [statusId]: sortOrder === 1 ? sortedTicketIds : sortedTicketIds.reverse()}
	}
	else {
		for (let key of Object.keys(board)){
			const ticketIdArray = board[key]
			const ticketAndPriorities = ticketIdArray.map((ticketId) => {
				const ticket = tickets.find((ticket: Ticket)=>ticket.id === ticketId)
				if (ticket){
					const priority = priorities.find((priority: Priority) => priority.id === ticket.priorityId)
					if (priority){
						return {priorityOrder: priority.order, id: ticketId, name: ticket.name}	
					}
				}
				return {priorityOrder: 0, id: 0, name: ""}	
			})
			const sortedTicketAndPriorities = prioritySortHelper(ticketAndPriorities.filter((obj) => obj.id !== 0))
			const sortedTicketIds = sortedTicketAndPriorities.map((obj) => obj.id)
			tempBoard = {...tempBoard, [key]: sortOrder === 1 ? sortedTicketIds : sortedTicketIds.reverse()}
		}
	}
	return tempBoard
}

export const prioritySortHelper = (tickets: Array<{priorityOrder: number, id: number, name: string}>) => {
	const sortKey = (a: {priorityOrder: number, id: number, name: string}, b: {priorityOrder: number, id: number, name: string}) => {
		if (a && b){
			if (a.priorityOrder < b.priorityOrder){
				return -1
			}
			else if (a.priorityOrder > b.priorityOrder){
				return 1
			}
			else {
				if (a.name < b.name){
					return 1
				}
				else if (a.name > b.name){
					return -1
				}
			}
		}	
		return 0
	}	
	return tickets.sort(sortKey)
}

export const sortStatusByOrder = (a: Status, b: Status) => {
	if (a.order < b.order){
		return -1
	}
	else if (a.order > b.order){
		return 1
	}
	return 0
}

export const doTicketsContainStatus = (statusId: number, tickets: Array<number>) => {
	// const ticketsWithStatus = tickets.filter((ticket) => ticket.status.id === statusId)	
	// return ticketsWithStatus.length > 0
	return false
}

/**
 * @param backend error response as an object
 * @return Array of strings containing the parsed error messages
 */
export const parseErrorResponse = (err: Record<string, any>): Array<string> => {
	return Object.values(err).map((e) => e[0])
}

/**
 * @param parse url parameters
 * @return url string with params included
 */
export const parseURLParams = (params: Record<string, any>) => {
	const keys = Object.keys(params)
	return keys.reduce((acc, key, i) => {
		if (i < keys.length - 1){
			return acc + `${key}=${params[key]}&`
		}
		return acc + `${key}=${params[key]}`
	}, "")
}

/**
 * @param search parameters from useSearchParam() react router object 
 * @param defaultForm is the form fields 
 * @param pageUrl
 * @return url string with params included
 */
export const withUrlParams = (defaultForm: Record<string, any>, searchParams: Record<string, any>, pageUrl: string) => {
	Object.keys(defaultForm).forEach((key) => {
		pageUrl += `&${key}=${searchParams.get(key) ?? ""}`
	})
	return pageUrl
}

/**
 * @param user
 * @return string containing the users' first and last name if the user exists, otherwise returns an empty string
 */
export const displayUser = (user: Pick<UserProfile, "firstName" | "lastName"> | null | undefined) => {
	return user ? (user.firstName + " " + user.lastName) : ""
}

/**
 * @param word consisting of delimiter
 * @param delimiter used to delimit the word
 * @return string where the delimiter is replaced with white space, and then first character of each string is capitalized
 * and the remaining characters are lowercase
 * for example: BOARD_ADMIN becomes Board Admin
 */
export const parseDelimitedWord = (word: string, delimiter: string) => {
	const parts = word.split(delimiter)
	// capitalize the first character of each word, and the rest of the word is lowercase
	const edited = parts.map((part) => part[0].toUpperCase() + part.slice(1, part.length).toLowerCase())
	return edited.join(" ")
}

/**
 * @param string representing a date
 * @return boolean on whether the string represents a valid date
 */
export const isValidDateString = (dateString: string | null | undefined) => {
	if (dateString == null || dateString == undefined){
		return false
	}
    return !isNaN(Date.parse(dateString));
}

/**
 * @param minutes 
 * @return time display string in ww d hh mm format
 */
export const convertMinutesToTimeDisplay = (minutes: number, includeLeadingZeroes = false, excludeZeroedTimeUnits = false) => {
	/* 
	Approach:
	1) Figure out how many weeks go evenly into the amount of minutes using integer division,
	then multiply the amount based on the conversion rate (10,080 minutes in a week) to get the 
	actual amount of minutes, and subtract from the total amount of minutes.
	2) Repeat this process for the next largest unit of time (days)

	Note that if at any point, the integer division results in 0, this would result in
	this unit of measurement having a value of 0. Move onto the next unit of measurement instead.

	Example:	
	160000 minutes
	weeks conversion = how many minutes in a week?
	60 minutes/1 hr * 24 hrs/1 day * 7 days/1 week = 60 * 24 * 7 = 10,080 minutes
	160000 minutes//10080 minutes = 15 weeks
	10080 * 15 = 151200
	160000 - 151200 = 8800 minutes remaining

	60 minutes/1hr * 24hrs/1day = 1440 minutes
	8800//1440 = 6 days
	1440 * 6 = 8640 minutes
	8800 - 8640 = 160 minutes
	
	60 minutes/hr = 160//60 = 2

	160 - 120 = 40

	160000 minutes = 15 weeks 6 days 2 hours 40 minutes
	*/
	if (minutes > MAX_MINUTES || minutes < 0){
		return "invalid"
	}
	let curMinutes = minutes
	/* minutes in one week, minutes in one day, minutes in one hour respectively */
	const timeUnits = ["w", "d", "h"]
	const conversions = [MINUTES_PER_WEEK, MINUTES_PER_DAY, MINUTES_PER_HOUR]
	const res = []
	for (let i = 0; i < conversions.length; ++i){
		const amountOf = Math.floor(curMinutes/conversions[i])
		if (amountOf === 0){
			if (!excludeZeroedTimeUnits){
				res.push((includeLeadingZeroes && timeUnits[i] !== "d" ? `00` : `0`) + timeUnits[i])
			}
			continue
		}
		const actualAmountInMinutes = conversions[i] * amountOf 
		// include a leading zero if the amount is less than 10
		res.push((timeUnits[i] !== "d" && includeLeadingZeroes ? amountOf.toString().padStart(2, "0") : amountOf.toString()) + timeUnits[i])
		curMinutes -= actualAmountInMinutes
	}
	// include minutes, make sure leading zero is included if amount is less than 10
	if ((curMinutes === 0 && !excludeZeroedTimeUnits) || curMinutes > 0){
		res.push((includeLeadingZeroes ? curMinutes.toString().padStart(2, "0") : curMinutes.toString()) + "m")
	}
	return res.join(" ")
}

/**
 * @param time display string in __w _d __h __m format, where the underscores are a positive integer
 * @return minutes. Note that in case of parsing failure, it will return -1
 */
export const convertTimeDisplayToMinutes = (displayString: string) => {
	/* 
		Parse the display string 
		"__w _d __h __m"
		convert each of the time units to minutes and sum them together
		__w, use split to convert to [__, w], and then take the first portion
	*/
	try {
		const parts = displayString.split(" ")
		const weeks = Number(parts[0].split("w")[0]) * MINUTES_PER_WEEK
		const days = Number(parts[1].split("d")[0]) * MINUTES_PER_DAY
		const hours = Number(parts[2].split("h")[0]) * MINUTES_PER_HOUR
		const minutes = Number(parts[3].split("m")[0])
		if (isNaN(weeks) || isNaN(days) || isNaN(hours) || isNaN(minutes)){
			return -1
		}
		return weeks + days + hours + minutes
	}
	catch (e){
		return -1
	}
}
/**
 * @param value string in __w _d __h __m format, where the underscores are a positive integer
 * @return string if error, boolean if valid
 */
export const validateTimeFormat = (value: string): boolean | string => {
    const match = value.match(TIME_DISPLAY_FORMAT)
    if (!match) return "Invalid format. Example: 10w 6d 03h 20m."

    const weeks = parseInt(match[1])
    const days = parseInt(match[2])
    const hours = parseInt(match[3])
    const minutes = parseInt(match[4])

    const errors = []
    if (days === 0 && weeks === 0 && hours === 0 && minutes === 0){
    	return "Please enter time for at least one field. Example: 00w 6d 00h 00m"
    }
    if (days > 6) errors.push("Days must be between 0 and 6.")
    if (hours > 23) errors.push("Hours must be between 0 and 23.")
    if (minutes > 59) errors.push("Minutes must be between 0 and 59.")

    if (errors.length){
    	return errors.join("<br/>")
    }

    return true
}

/**
 * @param current width of the window
 * @return width of the modal in px
 */
export const getModalWidth = (width: number, type: string) =>{
	if (type === "small"){
		return `${width <= LG_BREAKPOINT ? width - 100 : LG_BREAKPOINT - 100 }px`
	}
	return `${width <= LG_BREAKPOINT + 140 ? width-40 : LG_BREAKPOINT + 140 }px`
}
