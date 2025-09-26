import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconArrowLeft = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<MdOutlineKeyboardArrowLeft/>
		</BaseIcon>
	)
}
