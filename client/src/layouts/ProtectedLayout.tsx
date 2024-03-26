import React from "react"
import { Link, Outlet, Navigate } from "react-router-dom" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { HamburgerButton } from "../components/HamburgerButton" 
import { SideBar } from "../components/SideBar"

const ProtectedLayout = () => {
	const token = useAppSelector((state) => state.auth.token)	

	if (!token){
		return <Navigate replace to = {"/login"}/>
	}

	return (
		<div>
			<SideBar/>
			<HamburgerButton/>
			<Outlet/>
		</div>
	)
}

export default ProtectedLayout

