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
		<button className = {`${props.disabled ? "tw-opacity-30" : ""} tw-group tw-flex tw-flex-row tw-gap-x-2 tw-items-center tw-p-2 dark:hover:tw-bg-gray-50 hover:tw-bg-gray-100 tw-rounded`} {...props}>
			<>
				{!isForward ? <IconArrowLeft className = "dark:tw-text-white dark:group-hover:tw-text-black tw-h-5 tw-w-5"/> : <IconArrowRight className="dark:tw-text-white dark:group-hover:tw-text-black tw-h-5 tw-w-5"/>}
				{text ? (
					<span className = "tw-font-bold dark:tw-text-white dark:group-hover:tw-text-slate-400 tw-text-lg">{text}</span>
				) : null}
				{children}
			</>
		</button>
	)
}
