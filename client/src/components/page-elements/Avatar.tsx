import React from "react"
import { CgProfile } from "react-icons/cg"
import { IconBuilding } from "../icons/IconBuilding"
import { useAppSelector } from "../../hooks/redux-hooks"
import { AVATAR_FONT_SIZES, AVATAR_SIZES } from "../../helpers/constants"

type Props = {
	size?: string 
	className?: string
	imageUrl: string | undefined
	isOrg?: boolean
	userInitials?: string
}

export const Avatar = ({size="s", className, imageUrl, isOrg, userInitials}: Props) => {
	const cName = `${size && size in AVATAR_SIZES ? AVATAR_SIZES[size] : AVATAR_SIZES.s} ${className}` 
	const fontSize = `${size && size in AVATAR_FONT_SIZES ? AVATAR_FONT_SIZES[size] : AVATAR_FONT_SIZES.s}`

	const defaultIcon = () => {
		if (isOrg){
			return (
				<IconBuilding className={`${size === "s" ? "tw-w-4 tw-h-4" : AVATAR_SIZES[size]} ${className}`}/>	
			)
		}	
		else {
			return (
				userInitials ? 
				(
					<div className={`${cName} tw-relative tw-inline-flex tw-items-center tw-justify-center w-overflow-hidden tw-bg-gray-100 tw-rounded-full dark:tw-bg-gray-600`}>
					    <span className={`${fontSize} tw-font-medium tw-text-gray-600 dark:tw-text-gray-300`}>{userInitials}</span>
					</div>
				) :
				<CgProfile className={cName}/>
			)
		}
	}
	return ( 
		<>
			{imageUrl ? <img className = {`${cName} tw-object-cover`} src={imageUrl}/> : defaultIcon()}
		</>
	)
}
