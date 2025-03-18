import { IconContext } from "react-icons"
import { IoIosWarning as WarningIcon } from "react-icons/io"
import { BaseIcon } from "./BaseIcon"

type Props = {
	color?: string
	className?: string
}

export const IconWarning = ({color, className}: Props) => {
	return (
		<BaseIcon color = {color ?? "var(--bs-danger)"} className={className}>
			<WarningIcon/>
		</BaseIcon>
	)	
}
