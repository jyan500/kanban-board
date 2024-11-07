import React from "react"
import { ProgressBarPercentage } from "../../types/common"

type Props = {
	percentages: Array<ProgressBarPercentage> 
}

export const ProgressBar = ({percentages}: Props) => {
	return (
		<div className = "tw-w-full tw-flex tw-flex-row">
			{percentages.map((percentage: ProgressBarPercentage, i: number) => {
				if (percentage.value > 0){
					return (
						<div style={{width: `${percentage.value}%`}} className = {`${i === 0 ? "tw-rounded-l-md" : "tw-rounded-r-md"} tw-text-white tw-text-center tw-h-8 ${percentage.className}`}></div>
					)
				}
			})}	
		</div>
	)
}
