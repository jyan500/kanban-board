import { MdLightMode } from "react-icons/md";
import { IconContext } from "react-icons"
import { BaseIcon } from "./BaseIcon"

type Props = {
	color?: string
	className?: string
}

export const IconLightMode = ({color, className}: Props) => {
	return (
		<BaseIcon color = {color} className={className}>
			<MdLightMode/>
		</BaseIcon>
	)	
}
