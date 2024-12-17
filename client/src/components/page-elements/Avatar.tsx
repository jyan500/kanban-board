import React from "react"
import { CgProfile } from "react-icons/cg"
import { useAppSelector } from "../../hooks/redux-hooks"

type Props = {
	size?: string 
	className?: string
	imageUrl: string | undefined
}

export const Avatar = ({size, className, imageUrl}: Props) => {
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const sizes: {[k: string]: string} = {
		"l": "tw-w-32 tw-h-32",
		"m": "tw-w-16 tw-h-16",
		"s": "tw-w-8 tw-h-8",
	}
	return ( 
		<>
			{imageUrl ? <img className = {`${size && size in sizes ? sizes[size] : sizes.s} ${className}`} src={imageUrl}/> : <CgProfile className = {`${size && size in sizes ? sizes[size] : sizes.s} ${className}`}/>}
		</>
	)
}