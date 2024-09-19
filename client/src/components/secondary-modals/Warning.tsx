import React from "react"
import { IconContext } from "react-icons"
import { IoIosWarning as WarningIcon } from "react-icons/io"
import { LoadingButton } from "../page-elements/LoadingButton"

type WarningProps = {
	title: string
	submitText: string
	cancelText: string
	onSubmit: () => void	
	onCancel: () => void
	isLoading?: boolean
}

export const Warning = ({isLoading, title, submitText, cancelText, onSubmit, onCancel, children}: React.PropsWithChildren<WarningProps>) => {
	return (
		<div>
			<div className = "tw-flex tw-flex-row tw-gap-x-4 tw-items-center">
				<IconContext.Provider value={{color: "var(--bs-danger)"}}>
					<WarningIcon className = "--l-icon"/>
				</IconContext.Provider>
				<strong>{title}</strong>
			</div>
			{children}
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				<LoadingButton className = {"button --alert"} isLoading={isLoading} onClick={onSubmit} text={submitText}/>
				<button className = "button --secondary" onClick={onCancel}>{cancelText}</button>
			</div>
		</div>
	)
}