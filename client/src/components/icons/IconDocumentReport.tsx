import { HiOutlineDocumentReport } from "react-icons/hi";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconDocumentReport = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<HiOutlineDocumentReport/>
		</BaseIcon>
	)
}

