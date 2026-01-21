import { IconContext } from "react-icons"
import { IoIosWarning as WarningIcon } from "react-icons/io"
import { BaseIcon } from "./BaseIcon"

type Props = {
	color?: string
	className?: string
}

export const IconWarning = ({color, className}: Props) => {
	return (
		<BaseIcon className={`${!color ? "tw-text-red-300" : color} ${className}`}>
			<WarningIcon/>
		</BaseIcon>
	)	
}
