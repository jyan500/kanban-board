import React from "react"
import { HamburgerButton } from "../HamburgerButton"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { logout } from "../../slices/authSlice" 
import { CgProfile } from "react-icons/cg"
import { LoadingSpinner } from "../LoadingSpinner"
import { privateApi } from "../../services/private" 
import { displayUser } from "../../helpers/functions"

interface Props {
	isFetching: boolean
}

export const TopNav = ({isFetching}: Props) => {
	const dispatch = useAppDispatch()
	const { organizations } = useAppSelector((state) => state.org)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { token } = useAppSelector((state) => state.auth)
	const onLogout = () => {
		dispatch(logout())
		dispatch(privateApi.util.resetApiState())
	}
	return (
		<div className = "tw-my-4 tw-w-full tw-flex tw-flex-row tw-justify-between tw-items-center">
			<HamburgerButton/>	
			<div className = "tw-flex tw-flex-row tw-gap-x-4 tw-items-center">
				{!isFetching ? (
					<>
						<div>
							<CgProfile className = "--l-icon"/>
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