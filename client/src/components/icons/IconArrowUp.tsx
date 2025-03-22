import { IoIosArrowUp as ArrowUp } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconArrowUp = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<ArrowUp/>
		</BaseIcon>
	)
}

