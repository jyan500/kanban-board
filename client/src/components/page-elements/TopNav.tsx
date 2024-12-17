import React, {useState, useEffect} from "react"
import { HamburgerButton } from "../HamburgerButton"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { logout } from "../../slices/authSlice" 
import { LoadingSpinner } from "../LoadingSpinner"
import { privateApi } from "../../services/private" 
import { displayUser } from "../../helpers/functions"
import { Avatar } from "./Avatar"

export const TopNav = () => {
	const dispatch = useAppDispatch()
	const { organizations } = useAppSelector((state) => state.org)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { token } = useAppSelector((state) => state.auth)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		if (userProfile && Object.keys(userProfile).length){
			setIsLoading(false)
		}
	}, [userProfile])

	const onLogout = () => {
		dispatch(logout())
		dispatch(privateApi.util.resetApiState())
	}
	return (
		<div className = "tw-my-4 tw-w-full tw-flex tw-flex-row tw-justify-between tw-items-center">
			<HamburgerButton/>	
			<div className = "tw-flex tw-flex-row tw-gap-x-4 tw-items-center">
				{!isLoading ? (
					<>
						<Avatar imageUrl = {userProfile?.imageUrl} size = "s" className = "tw-rounded-full"/>
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