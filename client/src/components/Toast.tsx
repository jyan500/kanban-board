import React, {ReactNode} from "react" 
import "../styles/toast.css"
import { IoMdClose } from "react-icons/io" 
import { IoIosCheckmarkCircle as SuccessIcon } from "react-icons/io"
import { IoIosWarning as WarningIcon } from "react-icons/io"
import { FaCircleXmark as FailureIcon } from "react-icons/fa6"

type Props = {
	message: string
	type: string
	onClose: () => void
}

export const Toast = ({message, type, onClose}: Props) => {
	const iconMap: {[key: string]: ReactNode} = {
		success: <SuccessIcon/>,
		failure: <FailureIcon/>,
		warning: <WarningIcon/>	
	}
	const toastIcon = iconMap[type] as ReactNode || null
	return (
		<div className={`toast --${type}`} role="alert">
			<div className="toast-message">
				{toastIcon && (
					<div className = "icon --icon-thumb">
					{toastIcon}
					</div>)}
				<p>{message}</p>	
			</div>
			<button 
				className = "close-button --transparent"
				onClick={onClose}
				>
				<IoMdClose className = "icon"/>
			</button>
		</div>
	)
}