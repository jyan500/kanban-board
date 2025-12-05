import React from "react"
import { Link } from "react-router-dom"

interface Props {
    icon: React.ReactNode
    link: string
    header: string
    subHeader: string
    children?: React.ReactNode
}

export const SummaryCard = ({icon, link, header, subHeader, children}: Props) => {
    return (
        <Link to={link} state={{resetFilters: true}} className="hover:tw-bg-gray-100 tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
            <div className="tw-flex tw-items-start tw-gap-3">
                <div className="tw-p-2 tw-bg-gray-100 tw-rounded">
                    {icon}
                </div>
                <div>
                    <div className="tw-text-2xl tw-font-semibold">{header}</div>
                    <div className="tw-text-sm tw-text-gray-500">{subHeader}</div>
                </div>
                {children}
            </div>
        </Link>
    )
}