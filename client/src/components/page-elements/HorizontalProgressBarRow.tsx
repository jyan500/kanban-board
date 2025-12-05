import React from "react"
import { ProgressBarItem } from "../../types/common"
import { HoverTooltip } from "../page-elements/HoverTooltip"
import { Link } from "react-router-dom"
import { TICKETS } from "../../helpers/routes"

interface Props {
    icon?: React.ReactNode
    item: ProgressBarItem
    showTooltip?: boolean
    link:  string 
}

export const HorizontalProgressBarRow = ({icon, item, link, showTooltip=true}: Props) => {
    return (
        <Link to={link} state={{resetFilters: true}} className = "tw-group">
            <div className="tw-flex tw-items-center tw-gap-2">
                {icon ? <span className="tw-text-sm group-hover:tw-opacity-80">{icon}</span> : null}
                <span className="group-hover:tw-opacity-80 tw-text-sm">{item.name}</span>
            </div>
            <div className = {`${icon ? "tw-ml-8" : ""}`}>
                <div className="tw-w-full tw-bg-gray-200 tw-rounded tw-h-6">
                    <div 
                        className="tw-relative tw-bg-gray-500 tw-h-6 tw-rounded tw-flex tw-items-center tw-justify-end tw-pr-2"
                        style={{width: `${item.percentage}%`}}
                    >
                        <span className="tw-text-xs tw-font-medium tw-text-white">{item.percentage}%</span>
                        {
                            showTooltip ? 
                            <HoverTooltip direction="right" text={item.hoverText}/>
                            : null
                        }
                    </div>
                </div>
            </div>
        </Link>
    )
}