import { IoIosHelpCircleOutline } from "react-icons/io";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconHelp = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<IoIosHelpCircleOutline/>
		</BaseIcon>
	)
}
