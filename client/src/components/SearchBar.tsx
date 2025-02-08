import React, { useEffect } from "react"
import { FaSearch } from "react-icons/fa";
import { IconContext } from "react-icons"
import { useFormContext } from "react-hook-form" 

interface Props {
	placeholder: string
	registerField: string
	registerOptions: Record<string, any>
}

export const SearchBar = ({placeholder, registerField, registerOptions}: Props) => {
	const { register } = useFormContext()
	return (
		<div className = "tw-w-full tw-relative">
			<IconContext.Provider value={{ className: "icon tw-absolute tw-top-3 tw-left-3"}}>
				<FaSearch/>
			</IconContext.Provider>
			<input {...register(registerField, registerOptions)} placeholder = {placeholder} className = "tw-w-full lg:tw-w-[32rem] !tw-pl-10" type = "text"/>
		</div>
	)	
}