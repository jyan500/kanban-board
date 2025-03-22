import { IoIosArrowDown as ArrowDown } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconArrowDown = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<ArrowDown/>
		</BaseIcon>
	)
}

