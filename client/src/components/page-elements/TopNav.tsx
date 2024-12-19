import React, {useState, useEffect, useRef} from "react"
import { HamburgerButton } from "../HamburgerButton"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { logout } from "../../slices/authSlice" 
import { LoadingSpinner } from "../LoadingSpinner"
import { privateApi } from "../../services/private" 
import { displayUser } from "../../helpers/functions"
import { Avatar } from "./Avatar"
import { useClickOutside } from "../../hooks/useClickOutside" 
import { FaBell } from "react-icons/fa";
import { IconContext } from "react-icons"
import { NotificationDropdown } from "../NotificationDropdown"

export const TopNav = () => {
	const dispatch = useAppDispatch()
	const [showDropdown, setShowDropdown] = useState(false)
	const { organizations } = useAppSelector((state) => state.org)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { token } = useAppSelector((state) => state.auth)
	const [isLoading, setIsLoading] = useState(true)
	const menuDropdownRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef(null)

	useEffect(() => {
		if (userProfile && Object.keys(userProfile).length){
			setIsLoading(false)
		}
	}, [userProfile])

	const onClickOutside = () => {
		setShowDropdown(false)	
	}

	const onLogout = () => {
		dispatch(logout())
		dispatch(privateApi.util.resetApiState())
	}

	useClickOutside(menuDropdownRef, onClickOutside, buttonRef)

	return (
		<div className = "tw-my-4 tw-w-full tw-flex tw-flex-row tw-justify-between tw-items-center">
			<HamburgerButton/>	
			<div className = "tw-flex tw-flex-row tw-gap-x-4 tw-items-center">
				{!isLoading ? (
					<>
						<Avatar imageUrl = {userProfile?.imageUrl} size = "s" className = "tw-rounded-full"/>
						<div className = "tw-relative tw-inline-block tw-text-left">
							<IconContext.Provider value = {{color: "var(--bs-dark-gray"}}>
								<button ref = {buttonRef} onClick={(e) => {
									e.preventDefault()
									setShowDropdown(!showDropdown)
								}} className = "--transparent tw-p-0 hover:tw-opacity-60"><FaBell className = "tw-ml-3 --l-icon"/></button>
								{
									showDropdown ? (
										<NotificationDropdown 
											notifications={[]}
											closeDropdown={onClickOutside} 
											ref = {menuDropdownRef}/>
									) : null
								}
							</IconContext.Provider>
						</div>
						<div>
							<span>{displayUser(userProfile)}</span>
						</div>
					</>
				) : (
					<LoadingSpinner/>
				)}
				<div>
					<button onClick={onLogout}>Logout</button>
				</div>
			</div>
		</div>
	)
}