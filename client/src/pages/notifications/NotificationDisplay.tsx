import React, { useEffect, useState } from "react"
import { Notifications } from "../../components/notifications/Notifications"

export const NotificationDisplay = () => {
	return <Notifications fromDashboard={false}/>
}
