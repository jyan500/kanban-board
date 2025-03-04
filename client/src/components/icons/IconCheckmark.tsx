import { IoMdCheckmark } from "react-icons/io";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconCheckmark = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<IoMdCheckmark/>
		</BaseIcon>
	)
}