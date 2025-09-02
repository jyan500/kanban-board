import { BsPencilSquare } from "react-icons/bs";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconPencil = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<BsPencilSquare/>
		</BaseIcon>
	)
}
