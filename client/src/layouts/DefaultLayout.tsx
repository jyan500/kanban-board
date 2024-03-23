import React from "react"
import { Link, Outlet, Navigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 

const DefaultLayout = () => {
	const token = useAppSelector((state) => state.auth.token)

	if (token){
		return <Navigate replace to = {"/"} />
	}

	return (
		<>
			<Outlet/>
		</>
	)
}

export default DefaultLayout
