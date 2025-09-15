import { IoFilter } from "react-icons/io5";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconFilter = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<IoFilter/>
		</BaseIcon>
	)
}
