import React, { useState, useEffect } from "react"
import { Link, Outlet, useParams } from "react-router-dom" 

export const AccountDisplay = () => {
	return (
		<div className = "tw-w-full">
			<Outlet/>
		</div>
	)
}
