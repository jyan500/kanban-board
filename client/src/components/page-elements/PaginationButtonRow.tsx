import React from "react"
import { IconArrowLeft } from "../icons/IconArrowLeft"
import { IconArrowRight } from "../icons/IconArrowRight"
import { ArrowButton } from "./ArrowButton"

interface Props {
    prevHandler: (value: number) => void
    nextHandler: (value: number) => void
    isDisabledPrev: boolean
    isDisabledNext: boolean
}
/* For simple pagination with only a left and right arrow buttons */
export const PaginationButtonRow = ({
    prevHandler,
    nextHandler,
    isDisabledNext,
    isDisabledPrev
}: Props) => {
    return (
        <div className="tw-flex tw-flex-row tw-items-center tw-gap-2">
            <ArrowButton 
                disabled={isDisabledPrev}
                onClick={() => prevHandler(-1)}
                isForward={false}>
            </ArrowButton>
            <ArrowButton 
                disabled={isDisabledNext}
                onClick={() => nextHandler(1)}
                isForward={true}>
            </ArrowButton>
        </div>
    )
}