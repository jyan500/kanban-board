import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { Link, Outlet, useParams } from "react-router-dom" 
import { Table } from "../../components/Table" 

export const AccountDisplay = () => {
	const dispatch = useAppDispatch()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	return (
		<div>
			<Outlet/>
		</div>
	)
}