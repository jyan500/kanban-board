import { HiOutlineSparkles } from "react-icons/hi2";
import { IoMdClose } from "react-icons/io";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconSparkle = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<HiOutlineSparkles/>
		</BaseIcon>
	)
}

