import React from "react"
import { LoadingSkeleton } from "./LoadingSkeleton"
import { CardPlaceholder } from "../placeholders/CardPlaceholder"
import { ColumnFormPlaceholder } from "../placeholders/ColumnFormPlaceholder"

export const TwoColumnLoading = () => {
	return (
	<>	
		<LoadingSkeleton width = "lg:tw-w-1/4" height = "tw-w-[500px]" className="tw-flex tw-flex-col tw-gap-y-4">
			<CardPlaceholder hasImage={true}/>
			<CardPlaceholder/>
		</LoadingSkeleton> 
		<LoadingSkeleton width = "tw-flex tw-flex-col tw-gap-y-2 tw-w-full" height = "tw-h-[500px]">
			<ColumnFormPlaceholder/>
		</LoadingSkeleton> 
	</>
	)
}

