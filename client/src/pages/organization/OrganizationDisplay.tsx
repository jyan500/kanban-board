import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { Link, Outlet, Navigate, useParams } from "react-router-dom" 
import { Table } from "../../components/Table" 

export const OrganizationDisplay = () => {
	const dispatch = useAppDispatch()
	const { userProfile } = useAppSelector((state) => state.userProfile)

	return (
		<div>
		</div>
	)
}
