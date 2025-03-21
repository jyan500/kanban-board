import { MdDelete } from "react-icons/md";
import { IconContext } from "react-icons"
import { BaseIcon } from "./BaseIcon"

type Props = {
	color?: string
	className?: string
}

export const IconDelete = ({color, className}: Props) => {
	return (
		<BaseIcon color = {color ?? "var(--bs-danger)"} className={className}>
			<MdDelete/>
		</BaseIcon>
	)	
}
