import React from "react"
import { STANDARD_BORDER } from "../../helpers/constants"

interface Props {
    className?: string
    width?: string
    children: React.ReactNode
}

export const BorderContainer = ({className, width, children}: Props) => {
    return (
        <div className={`${className} ${STANDARD_BORDER} tw-shadow-sm tw-rounded-md tw-p-2 lg:tw-p-4 ${width ?? "tw-w-full"}`}>
            {children}
        </div>
    )
}