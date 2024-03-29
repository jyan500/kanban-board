import React from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { Dashboard } from "../components/Dashboard"

export const Home = () => {

	return (
		<div>
			<Dashboard/>
		</div>
	)
}