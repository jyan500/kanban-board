import React from "react"
import "../styles/sidebar.css"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks"
import { toggleSideBar } from "../slices/navSlice" 
import { IoMdClose } from "react-icons/io";
import { Link, useLocation } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { LoadingSpinner } from "./LoadingSpinner" 
import { displayUser } from "../helpers/functions"
import { Logo } from "../components/page-elements/Logo"

interface Props {
	isFetching: boolean
}

export const SideBar = ({isFetching}: Props) => {
	const sideBar = useAppSelector((state) => state.nav)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { organizations } = useAppSelector((state) => state.org)
	const dispatch = useAppDispatch()
	const { pathname } = useLocation()
	const links = [
	{
		pathname: "/", text: "Dashboard",
	},
	{
		pathname: "/organizations", text: "Organizations",
	},
	{
		pathname: "/boards", text: "Boards",
	},
	{
		pathname: "/tickets", text: "Tickets",
	},
	{
		pathname: "/users", text: "Users",
	},
	{
		pathname: "/account", text: "Account",
	},
	]
	return (
		<div className = {`sidebar --card-shadow --transition-transform ${sideBar.showSidebar ? "--translate-x-0" : "--translate-x-full-negative"}`}>
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
							<Link key={link.pathname} onClick={(e) => dispatch(toggleSideBar(false))} to={link.pathname} className = {`${pathname === link.pathname ? "active" : ""}`}>
								{link.text}
							</Link>
						)
					}
				</div>
				<div className = "sidebar__bottom-bar">
					<div className = "sidebar__bottom-bar__content">
						{!isFetching ? (
							<>
								<div>
									<CgProfile className = "--l-icon"/>
								</div>
								<div>
									<span>{displayUser(userProfile)}</span>
									<small>{organizations.find((org) => org.id === userProfile?.organizationId)?.name}</small>
								</div>
							</>
						) : (
							<LoadingSpinner/>
						)}
					</div>
				</div>
			</div>
		</div>
	)	
}