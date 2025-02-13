import React from "react"
import { IoIosCheckmarkCircle as SuccessIcon } from "react-icons/io"
import { IoIosWarning as WarningIcon } from "react-icons/io"
import { FaCircleXmark as FailureIcon } from "react-icons/fa6"
import { iconMap, colorMap } from "../Toast"
import { IconContext } from "react-icons"

type Props = {
	type: string
	message?: string
	children?: React.ReactNode
}

export const Banner = ({type, message, children}: Props) => {
	const toastIcon = iconMap[type] as React.ReactNode || null
	const color = colorMap[type] as string
	return (
		<div className = {`toast tw-flex tw-flex-row tw-items-center tw-justify-center tw-w-96 tw-gap-x-4 tw-p-4 --${type}`}>
			<IconContext.Provider value = {{color: color, className: "--l-icon"}}>
				{toastIcon && (
					<div className = {`--icon-thumb`}>
					{toastIcon}
					</div>)}
			</IconContext.Provider>
			{message ? (<p>{message}</p>) : null}
			{children}
		</div>
	)
}
