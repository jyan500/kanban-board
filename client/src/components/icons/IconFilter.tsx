import { LuListFilter } from "react-icons/lu";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconFilter = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<LuListFilter/>
		</BaseIcon>
	)
}
