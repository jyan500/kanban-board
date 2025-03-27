import React from "react"
import { LoadingSkeleton } from "./LoadingSkeleton"
import { RowPlaceholder } from "../placeholders/RowPlaceholder"

interface Props {
	width?: string
	height?: string
}

export const RowContentLoading = ({width="tw-w-full", height="tw-h-84"}: Props) => {
	return (
		<LoadingSkeleton width={width} height = {height}>
			<RowPlaceholder/>	
		</LoadingSkeleton>
	)
}