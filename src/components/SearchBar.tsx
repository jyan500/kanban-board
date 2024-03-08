import React from "react"
import { FaSearch } from "react-icons/fa";
import "../styles/searchbar.css"

export const SearchBar = () => {
	return (
		<div className = "searchbar">
			<FaSearch className = "icon searchbar--icon"/>
			<input className = "--icon-shift" type = "text"/>
		</div>
	)	
}