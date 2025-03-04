import { IconContext } from "react-icons"

interface Props {
	color?: string
	className?: string
	children: React.ReactNode
}

export const BaseIcon = ({color, className, children}: Props) => {
	return (
		<IconContext.Provider value={{color: color ?? "", className: className ?? "tw-w-4 tw-h-4"}}>
			{children}
		</IconContext.Provider>
	)
}