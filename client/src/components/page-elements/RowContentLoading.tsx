import React from "react"
import { LoadingSkeleton } from "./LoadingSkeleton"
import { RowPlaceholder } from "../placeholders/RowPlaceholder"

export const RowContentLoading = () => {
	return (
		<LoadingSkeleton width="tw-w-full" height = "tw-h-84">
			<RowPlaceholder/>	
		</LoadingSkeleton>
	)
}