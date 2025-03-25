import React, { useState, useEffect } from "react"
import "../styles/sidebar.css"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks"
import { toggleSideBar } from "../slices/navSlice" 
import { IconClose } from "./icons/IconClose";
import { Link, useLocation } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { LoadingSpinner } from "./LoadingSpinner" 
import { displayUser } from "../helpers/functions"
import { Logo } from "../components/page-elements/Logo"
import { useGetUserRolesQuery } from "../services/private/userRole"
import { useGetUserProfileQuery } from "../services/private/userProfile"
import { Avatar } from "./page-elements/Avatar"
import { NavLink } from "./page-elements/NavLink"
import { GradientContainer } from "./page-elements/GradientContainer"

export const SideBar = () => {
	const sideBar = useAppSelector((state) => state.nav)
	const { data: userRoles, isFetching: isUserRolesFetching } = useGetUserRolesQuery()
	const { data: userProfile, isFetching: isUserProfileFetching } = useGetUserProfileQuery()
	const [isLoading, setIsLoading] = useState(true)
	const [isAdmin, setIsAdmin] = useState(false)
	
	const defaultLinks = [
		{
			pathname: "/", text: "Dashboard",
		},
		{
			pathname: "/boards", text: "Boards",
		},
		{
			pathname: "/tickets", text: "Tickets",
		},
	]
	const accountLink = [
		{
			pathname: "/account", text: "Account",
		},
	]
	const [ links, setLinks ] = useState([
		...defaultLinks, ...accountLink
	])
	const dispatch = useAppDispatch()
	const { pathname } = useLocation()

	useEffect(() => {
		if (!isUserProfileFetching && !isUserRolesFetching){
			const admin = userRoles?.find((role) => role.name === "ADMIN")
			const isAdmin = userProfile && admin?.id === userProfile.userRoleId
			setIsAdmin(isAdmin ?? false)
			setLinks([
				...userProfile?.isActive ? defaultLinks : [],
				...(isAdmin && userProfile?.isActive ? [
				{
					pathname: "/users", text: "Users"
				},
				{
					pathname: "/organization", text: "Organization"
				}
				]: []),
				...accountLink
			])
			setIsLoading(false)
		}
	}, [isUserProfileFetching, isUserRolesFetching])

	return (
		<div className = {`sidebar --card-shadow --transition-transform ${sideBar.showSidebar ? "--translate-x-0" : "--translate-x-full-negative"}`}>
			{isLoading ? (<LoadingSpinner/>) : (
				<>
					<button 
						className = "close-button --transparent"
						onClick={
							() => {
								dispatch(toggleSideBar(false))
							}
						}
						>
					<IconClose color="white" className = "icon"/></button>	
					<GradientContainer className = "tw-p-4 tw-flex tw-items-center tw-h-20 tw-rounded-sm">
						<Logo isLandingPage={false}/>
					</GradientContainer>
					<div className = "sidebar__container">
						<div className = "sidebar__links">
							{ 
								links.map((link) => 
									<NavLink text={link.text} url={link.pathname} onClick={() => dispatch(toggleSideBar(false))}/>
								)
							}
						</div>
						<GradientContainer className = "tw-h-20 sidebar__bottom-bar">
							<div className = "sidebar__bottom-bar__content">
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
									<Avatar imageUrl={userProfile?.imageUrl} className = "tw-rounded-full"/>
									<div>
										<span>{displayUser(userProfile)}</span>
										<small>{userProfile?.organizationName}</small>
									</div>
								</div>
							</div>
						</GradientContainer>
					</div>
				</>
			)}
		</div>
	)	
}
