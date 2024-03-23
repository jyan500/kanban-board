import React from "react"
import { Link, Outlet, Navigate } from "react-router-dom" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 

const ProtectedLayout = () => {
	const token = useAppSelector((state) => state.auth.token)	

	if (!token){
		return <Navigate replace to = {"/login"}/>
	}

	return (
		<>
			<Outlet/>
		</>
	)
}

export default ProtectedLayout

