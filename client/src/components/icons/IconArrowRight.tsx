import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconArrowRight = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<MdOutlineKeyboardArrowRight/>
		</BaseIcon>
	)
}

