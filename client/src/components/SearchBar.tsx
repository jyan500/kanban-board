import React, { useEffect } from "react"
import { FaSearch } from "react-icons/fa";
import "../styles/searchbar.css"

type Props = {
	placeholder: string
	onChange: (value: string) => void
}

export const SearchBar = ({placeholder, onChange}: Props) => {
	return (
		<div className = "searchbar">
			<FaSearch className = "icon searchbar--icon"/>
			<input onChange={(e) => onChange(e.target.value)} placeholder = {placeholder} className = "--icon-shift" type = "text"/>
		</div>
	)	
}