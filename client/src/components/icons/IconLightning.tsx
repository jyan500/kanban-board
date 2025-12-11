import { RxLightningBolt } from "react-icons/rx";
import { BsFillLightningChargeFill } from "react-icons/bs";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
	isFilled?: boolean
}

export const IconLightning = ({color, className, isFilled}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			{
				isFilled ?
				<BsFillLightningChargeFill/>
				: 
				<RxLightningBolt/>
			}
		</BaseIcon>
	)
}
