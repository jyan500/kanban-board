import React, { useState, useEffect } from 'react'
import { setVisibility, TooltipKeys } from "../../slices/tooltipSlice"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { IconClose } from "../icons/IconClose"

interface Props {
    text: string
    type: keyof TooltipKeys
    button: React.ReactNode
    className?: string
    icon?: React.ReactNode
    handler: () => void
}

/* Tooltip that only shows once per login session */
export const Tooltip = ({text, className, type, button, handler, icon}: Props) => {
    const dispatch = useAppDispatch()
    const { visibility } = useAppSelector((state) => state.tooltip)

    const onClick = (withHandler=false) => {
        dispatch(setVisibility({tooltipKey: type, value: false}))
        if (withHandler) { 
            handler() 
        }
    }

    return (
        <div className="tw-relative tw-inline-block tw-text-left">
            {button}
            {visibility[type] ? (
                <div className={`${className} tw-flex tw-flex-col tw-gap-y-2 tw-items-start tw-absolute tw-right-full tw-top-1/2 -tw-translate-y-1/2 tw-bg-light-purple tw-text-white tw-text-xs tw-rounded tw-p-1.5 tw-shadow tw-z-10`}>
                    {/* Tooltip arrow */}
                    <span className="tw-absolute tw-left-full tw-top-1/2 -tw-translate-y-1/2 tw-border-8 tw-border-transparent tw-border-l-light-purple" />
                    <div className = "tw-items-start tw-flex tw-flex-row tw-gap-x-1">
                        {icon ? icon : null}
                        <p className = "tw-font-semibold">{text}</p>
                    </div>
                    <button onClick={(e) => onClick(true)} className = "tw-border tw-border-white hover:tw-opacity-60 tw-p-1.5 tw-rounded-md">Here</button>
                    <button onClick={(e) => onClick()} className = "tw-absolute tw-top-0 tw-right-0 tw-mr-1 tw-mt-1"><IconClose className = "tw-text-white tw-w-3 tw-h-3"/></button>
                </div>
            ) : null}
        </div>
    )
}
