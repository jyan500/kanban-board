import React from "react"
import { CgProfile } from "react-icons/cg"
import { IconBuilding } from "../icons/IconBuilding"
import { useAppSelector } from "../../hooks/redux-hooks"

type Props = {
	size?: string 
	className?: string
	imageUrl: string | undefined
	isOrg?: boolean
}

export const Avatar = ({size="s", className, imageUrl, isOrg}: Props) => {
	const sizes: {[k: string]: string} = {
		"l": "tw-w-32 tw-h-32",
		"m": "tw-w-16 tw-h-16",
		"s": "tw-w-6 tw-h-6",
	}
	const cName = `${size && size in sizes ? sizes[size] : sizes.s} ${className}` 
	const defaultIcon = () => {
		if (isOrg){
			return (
				<IconBuilding className={`${size === "s" ? "tw-w-4 tw-h-4" : sizes[size]} ${className}`}/>	
			)
		}	
		else {
			return (
				<CgProfile className={cName}/>
			)
		}
	}
	return ( 
		<>
			{imageUrl ? <img className = {cName} src={imageUrl}/> : defaultIcon()}
		</>
	)
}
