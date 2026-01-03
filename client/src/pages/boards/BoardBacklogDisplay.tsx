import { Outlet } from "react-router-dom"

export const BoardBacklogDisplay = () => {
    return (
		<div className = "tw-w-full tw-flex tw-flex-col tw-gap-y-4">
			<Outlet/>	
		</div>
    )
}
