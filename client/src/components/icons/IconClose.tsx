import { IoMdClose } from "react-icons/io";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconClose = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<IoMdClose/>
		</BaseIcon>
	)
}
