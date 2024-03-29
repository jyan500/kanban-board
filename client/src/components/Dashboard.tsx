import React from "react"
import "../styles/dashboard.css"

export const Dashboard = () => {
	return (
		<div className = "dashboard-container">
			<div>
				<h1>Assigned To Me</h1>
			</div>
			<div>
				<h1>My Organization</h1>
			</div>
			<div>
				<h1>Backlog</h1>
			</div>
		</div>
	)	
}