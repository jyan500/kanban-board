import React, { useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { Dropdown } from "./Dropdown" 
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../slices/secondaryModalSlice" 
import { Toast, Ticket, Status, UserProfile } from "../types/common"
import { CgProfile } from "react-icons/cg"
import { IoMdEye as WatchIcon, IoMdEyeOff as WatchOffIcon } from "react-icons/io";
import { 
	useAddTicketAssigneeMutation,
	useDeleteTicketAssigneeMutation, 
} from "../services/private/ticket"
import { addToast } from "../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"
import { displayUser } from "../helpers/functions"
import { FiPlus as PlusIcon } from "react-icons/fi";

type Props = {
	closeDropdown: () => void
	ticket: Ticket | null | undefined
	ticketAssignee: UserProfile | null | undefined
	ticketWatchers: Array<UserProfile> | null | undefined
}

export const WatchMenuDropdown = React.forwardRef<HTMLDivElement, Props>(({closeDropdown, ticket, ticketAssignee, ticketWatchers}: Props, ref) => {
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const userRole = userProfile && userRoleLookup ? userRoleLookup[userProfile?.userRoleId] : null
	const dispatch = useAppDispatch()
	const isAdminOrBoardAdmin = userRole && (userRole === "ADMIN" || userRole === "BOARD_ADMIN")
	const isTicketReporter = userRole && userRole === "USER" && ticket?.userId === userProfile?.id
	const epicTicketType = ticketTypes.find((ticketType) => ticketType.name === "Epic")
	const watcher: UserProfile | undefined = ticketWatchers?.find((watcher: UserProfile) => watcher.id === userProfile?.id)
	const [ addTicketAssignee, {isLoading: addTicketAssigneeLoading} ] = useAddTicketAssigneeMutation()
	const [ deleteTicketAssignee, {isLoading: isDeleteTicketAssigneeLoading}] = useDeleteTicketAssigneeMutation()

	const addTicketWatcher = async (ticketId: number | null | undefined, userId: number | null | undefined) => {
		let defaultToast: Toast = {
			id: uuidv4(),
			type: "success",
			animationType: "animation-in",
			message: "You are now watching this ticket!"
		}
		try {
			if (ticketId && userId){
				await addTicketAssignee({ticketId: ticketId, userIds: [userId], isWatcher: true}).unwrap()
				dispatch(addToast(defaultToast))
			}
		}
		catch (e) {
			dispatch(addToast({
				...defaultToast,
				type: "failure",
				message: "Failed to add ticket watcher"
			}))
		}
	}

	const showAddWatchersModal = () => {
		dispatch(toggleShowSecondaryModal(true))
		dispatch(setSecondaryModalProps({ticketAssigneeId: ticketAssignee?.id, ticketId: ticket?.id}))
		dispatch(setSecondaryModalType("ADD_TICKET_WATCHERS_MODAL"))
	}

	const deleteTicketWatcher = async (ticketId: number | null | undefined, userId: number | null | undefined) => {
		let defaultToast: Toast = {
			id: uuidv4(),
			type: "success",
			animationType: "animation-in",
			message: "Ticket watcher removed successfully!"
		}
		try {
			if (ticketId && userId){
				await deleteTicketAssignee({ticketId: ticketId, userId: userId}).unwrap()
				dispatch(addToast(defaultToast))
			}
		}
		catch (e) {
			dispatch(addToast({
				...defaultToast,
				type: "failure",
				message: "Failed to remove ticket watcher"
			}))
		}
	} 

	let options = {
		...(userProfile?.id !== ticketAssignee?.id ? (!watcher ? {
			"Start Watching": () => {
				addTicketWatcher(ticket?.id, userProfile?.id)
			}
		} : {
			"Stop Watching": () => {
				deleteTicketWatcher(ticket?.id, userProfile?.id)
			}
		}) : {}),
		...(isAdminOrBoardAdmin || isTicketReporter ? {
			"Add Watchers": () => {
			
			}
		} : {}),
	}
	return (
		<Dropdown ref = {ref}>
			<ul>
				{Object.keys(options).map((option) => {
					if (option === "Start Watching" || option === "Stop Watching"){
						return (
							<li
								key={option}
								onClick={() => options[option as keyof typeof options]?.()}
								className="tw-border-b tw-block hover:tw-bg-gray-50 tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 tw-hover:text-gray-900"
								role="menuitem"
							>
								<div className = "tw-flex tw-flex-row tw-gap-x-2">
									{option === "Start Watching" ? 
									<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center"><WatchIcon className = "tw-w-6 tw-h-6"/><p>{option}</p></div>
									: <div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center"><WatchOffIcon className = "tw-w-6 tw-h-6"/><p>{option}</p></div>}
								</div>
							</li>
						)
					}
				})}
				<li
					className="tw-block hover:tw-bg-gray-50 tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 tw-hover:text-gray-900"
					role = "menuitem"
				>
					<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-py-1">
						<p>Watching This Issue</p>
						<div className = "tw-flex tw-flex-col tw-gap-y-2">
							{
								ticketWatchers?.map((watcher) => {
									return (
										<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2 tw-py-1">
											<CgProfile className = "tw-w-6 tw-h-6"/>
											<p key = {`watcher_${watcher.id}`}>{displayUser(watcher)}
											</p>
										</div>
									)
								})
							}
						</div>
					</div>
				</li>
				<li
					className="tw-border-t tw-block hover:tw-bg-gray-50 tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 tw-hover:text-gray-900"
					onClick={() => options["Add Watchers"]?.()}
					role = "menuitem"
				>
					<button onClick={() => {
						showAddWatchersModal()
						closeDropdown()
					}}>
						<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
							<PlusIcon className = "tw-h-6 tw-w-6"/>
							<p>Add Watchers</p>
						</div>
					</button>
				</li>
			</ul>
		</Dropdown>
	)	
})

