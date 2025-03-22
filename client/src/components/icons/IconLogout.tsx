import { MdLogout } from "react-icons/md";
import { IconContext } from "react-icons"
import { IoIosWarning as WarningIcon } from "react-icons/io"
import { BaseIcon } from "./BaseIcon"

type Props = {
	color?: string
	className?: string
}

export const IconLogout = ({color, className}: Props) => {
	return (
		<BaseIcon color = {color} className={className}>
			<MdLogout/>
		</BaseIcon>
	)	
}
