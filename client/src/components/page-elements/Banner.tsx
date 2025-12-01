import React from "react"
import { IoIosCheckmarkCircle as SuccessIcon } from "react-icons/io"
import { IoIosWarning as WarningIcon } from "react-icons/io"
import { FaCircleXmark as FailureIcon } from "react-icons/fa6"
import { iconMap, toastColorMap } from "../Toast"
import { IconContext } from "react-icons"

type Props = {
	type: string
	message?: string
	children?: React.ReactNode
}

export const Banner = ({type, message, children}: Props) => {
	const toastIcon = iconMap[type] as React.ReactNode || null
	const color = toastColorMap[type] as string
	return (
		<div className = {`toast tw-flex tw-flex-col tw-w-96 tw-p-4 --${type}`}>
			<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-4">
				<IconContext.Provider value = {{color: color, className: "--l-icon"}}>
					{toastIcon && (
						<div className = {`--icon-thumb`}>
						{toastIcon}
						</div>)}
				</IconContext.Provider>
				<div className = "tw-flex-col tw-flex tw-flex-1 tw-gap-y-0.5">
					{message ? (<p className = "tw-font-bold">{message}</p>) : null}
					{children}
				</div>
			</div>
		</div>
	)
}
