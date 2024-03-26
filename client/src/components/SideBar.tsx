import React from "react"
import "../styles/sidebar.css"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks"
import { toggleSideBar } from "../slices/navSlice" 
import { IoMdClose } from "react-icons/io";
import { Link, useLocation } from 'react-router-dom';

export const SideBar = () => {
	const sideBar = useAppSelector((state) => state.nav)
	const dispatch = useAppDispatch()
	const { pathname } = useLocation()
	return (
		<div className = {`sidebar --transition-transform ${sideBar.showSidebar ? "--translate-x-0" : "--translate-x-full-negative"}`}>
			<button 
				className = "close-button --transparent"
				onClick={
					() => {
						dispatch(toggleSideBar(false))
					}
				}
				>
			<IoMdClose className = "icon"/></button>	
			<div>
				<h2>Welcome to Kanban Board</h2>
				<ul>
					<li className = {`${pathname === "/" ? "active" : ""}`}><Link className = {`${pathname === "/" ? "active" : ""}`} to="/">Dashboard</Link></li>
					<li className = {`${pathname === "/organizations" ? "active" : ""}`}><Link className = {`${pathname === "/organizations" ? "active" : ""}`} to="/">Organizations</Link></li>
					<li className = {`${pathname === "/boards" ? "active" : ""}`}><Link className = {`${pathname === "/boards" ? "active" : ""}`} to="/">Boards</Link></li>
				</ul>
			</div>
		</div>
	)	
}