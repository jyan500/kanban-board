import React from "react"
import { Link } from "react-router-dom"
import { 
    CELL_BACKGROUND, 
    NESTED_TABLE_BACKGROUND, 
    PRIMARY_TEXT, 
    STANDARD_BORDER, 
    SECONDARY_TEXT, 
    STANDARD_HOVER 
} from "../../helpers/constants"

interface Props {
    icon: React.ReactNode
    link: string
    header: string
    subHeader: string
    children?: React.ReactNode
}

export const SummaryCard = ({icon, link, header, subHeader, children}: Props) => {
    return (
        <Link to={link} className={`${STANDARD_HOVER} ${NESTED_TABLE_BACKGROUND} tw-rounded-lg ${STANDARD_BORDER} tw-p-6`}>
            <div className="tw-flex tw-items-start tw-gap-3">
                <div className={`tw-p-2 ${CELL_BACKGROUND} tw-rounded`}>
                    {icon}
                </div>
                <div>
                    <div className={`${PRIMARY_TEXT} tw-text-2xl tw-font-semibold`}>{header}</div>
                    <div className={`tw-text-sm ${SECONDARY_TEXT}`}>{subHeader}</div>
                </div>
                {children}
            </div>
        </Link>
    )
}
