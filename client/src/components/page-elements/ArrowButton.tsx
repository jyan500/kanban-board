import React from "react"
import { IconArrowLeft } from "../icons/IconArrowLeft";
import { IconArrowRight } from "../icons/IconArrowRight";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode
	isForward?: boolean
	text?: string
    className?: string
}

export const ArrowButton = ({isForward, text, children, ...props}: Props) => {
	return (
		<button className = {`${props.disabled ? "tw-opacity-30" : ""} tw-flex tw-flex-row tw-gap-x-2 tw-items-center tw-p-2 hover:tw-bg-gray-100 tw-rounded`} {...props}>
			<>
				{!isForward ? <IconArrowLeft className = "tw-h-5 tw-w-5"/> : <IconArrowRight className="tw-h-5 tw-w-5"/>}
				{text ? (
					<span className = "tw-font-bold tw-text-lg">{text}</span>
				) : null}
				{children}
			</>
		</button>
	)
}
