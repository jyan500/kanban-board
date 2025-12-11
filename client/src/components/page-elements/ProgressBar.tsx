import React from "react"
import { ProgressBarPercentage } from "../../types/common"

type Props = {
	percentages: Array<ProgressBarPercentage> 
}

export const ProgressBar = ({percentages}: Props) => {
	return (
		// overflow-hidden must be added so the colored bars do not overflow on top of the rounded borders
		<div className = "tw-rounded-md tw-overflow-hidden tw-bg-gray-100 tw-w-full tw-h-2.5 tw-flex tw-flex-row">
			{percentages.map((percentage: ProgressBarPercentage, i: number) => {
				if (percentage.value > 0){
					return (
						<div key={`progress-bar-percentage-${i}`} style={{width: `${percentage.value}%`}} className = {`tw-text-white tw-text-center ${percentage.className}`}></div>
					)
				}
			})}	
		</div>
	)
}
