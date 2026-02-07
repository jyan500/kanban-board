import React from "react"
import { IconWarning } from "../icons/IconWarning"
import { LoadingButton } from "../page-elements/LoadingButton"
import { Button } from "../page-elements/Button"
import { PRIMARY_TEXT } from "../../helpers/constants"

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
				<IconWarning className = "--l-icon"/>
				<p className={`${PRIMARY_TEXT} tw-font-bold`}>{title}</p>
			</div>
			{children}
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				<LoadingButton theme="alert" isLoading={isLoading} onClick={onSubmit} text={submitText}/>
				<Button theme="secondary" onClick={onCancel}>{cancelText}</Button>
			</div>
		</div>
	)
}