import React, { useState, useEffect } from "react"
import "../styles/sidebar.css"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks"
import { toggleSideBar } from "../slices/navSlice" 
import { IoMdClose } from "react-icons/io";
import { Link, useLocation } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { LoadingSpinner } from "./LoadingSpinner" 
import { displayUser } from "../helpers/functions"
import { Logo } from "../components/page-elements/Logo"
import { useGetUserRolesQuery } from "../services/private/userRole"
import { useGetUserProfileQuery } from "../services/private/userProfile"
import { Avatar } from "./page-elements/Avatar"
import { NavLink } from "./page-elements/NavLink"

export const SideBar = () => {
	const sideBar = useAppSelector((state) => state.nav)
	const { data: userRoles, isLoading: isUserRolesLoading } = useGetUserRolesQuery()
	const { data: userProfile, isLoading: isUserProfileLoading } = useGetUserProfileQuery()
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
		if (!isUserProfileLoading && !isUserRolesLoading){
			const admin = userRoles?.find((role) => role.name === "ADMIN")
			const isAdmin = userProfile && admin?.id === userProfile.userRoleId
			setIsAdmin(isAdmin ?? false)
			setLinks([
				...defaultLinks,
				...(isAdmin ? [
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
	}, [isUserProfileLoading, isUserRolesLoading])

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
					<IoMdClose className = "icon"/></button>	
					<div className = "sidebar__container">
						<Logo isLandingPage={false}/>
						<div className = "sidebar__links">
							{ 
								links.map((link) => 
									// <li key = {link.pathname} className = {`${pathname === link.pathname ? "active" : ""}`} >
									// 	<Link to={link.pathname} className = {`${pathname === link.pathname ? "active" : ""}`}>{link.text}</Link>
									// </li>
									// <Link key={link.pathname} onClick={(e) => dispatch(toggleSideBar(false))} to={link.pathname} className = {`${pathname === link.pathname ? "active" : ""}`}>
									// 	{link.text}
									// </Link>
									<NavLink text={link.text} url={link.pathname} onClick={() => dispatch(toggleSideBar(false))}/>
								)
							}
						</div>
						<div className = "sidebar__bottom-bar">
							<div className = "sidebar__bottom-bar__content">
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
									<Avatar imageUrl={userProfile?.imageUrl} className = "tw-rounded-full"/>
									<div>
										<span>{displayUser(userProfile)}</span>
										<small>{userProfile?.organizationName}</small>
									</div>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	)	
}
