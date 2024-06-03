import React, {ReactNode} from "react" 
import "../styles/toast.css"
import { IoMdClose } from "react-icons/io" 
import { IoIosCheckmarkCircle as SuccessIcon } from "react-icons/io"
import { IoIosWarning as WarningIcon } from "react-icons/io"
import { FaCircleXmark as FailureIcon } from "react-icons/fa6"
import { IconContext } from "react-icons"

type Props = {
	id: string
	message: string
	type: string
	onClose: () => void
	animationStyle: Record<string, any>
	animationHandler: (id: string) => void
}

export const Toast = ({id, message, type, onClose, animationStyle, animationHandler}: Props) => {
	const iconMap: {[key: string]: ReactNode} = {
		success: <SuccessIcon/>,
		failure: <FailureIcon/>,
		warning: <WarningIcon/>	
	}
	const colorMap: {[key: string]: string} = {
		success: "var(--bs-success)",	
		failure: "var(--bs-danger)",
		warning: "var(--bs-warning)",
	}
	const toastIcon = iconMap[type] as ReactNode || null
	const color = colorMap[type] as string
	return (
		<div id = {id} 
			onAnimationEnd={(e) => animationHandler(id)}
			style = {animationStyle} 
			className={`toast --${type}`} role="alert">
			<div className="toast-message">
				<IconContext.Provider value = {{color: color, className: "--l-icon"}}>
					{toastIcon && (
						<div className = {`--icon-thumb`}>
						{toastIcon}
						</div>)}
				</IconContext.Provider>
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