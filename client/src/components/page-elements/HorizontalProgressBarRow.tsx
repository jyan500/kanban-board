import React from "react"
import { ProgressBarItem } from "../../types/common"

interface Props {
    icon?: React.ReactNode
    item: ProgressBarItem
}

export const HorizontalProgressBarRow = ({icon, item}: Props) => {
    return (
        <>
            <div className="tw-flex tw-items-center tw-gap-2">
                {icon ? <span className="tw-text-sm">{icon}</span> : null}
                <span className="tw-text-sm">{item.name}</span>
            </div>
            <div className = {`${icon ? "tw-ml-8" : ""}`}>
                <div className="tw-w-full tw-bg-gray-200 tw-rounded tw-h-6">
                    <div 
                        className="tw-bg-gray-400 tw-h-6 tw-rounded tw-flex tw-items-center tw-justify-end tw-pr-2"
                        style={{width: `${item.percentage}%`}}
                    >
                        <span className="tw-text-xs tw-font-medium tw-text-gray-700">{item.percentage}%</span>
                    </div>
                </div>
            </div>
        </>
    )
}