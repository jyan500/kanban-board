import React, { useState, useCallback } from "react"
import Select from "react-select"
import { useGenericFetchQuery } from "../services/private/generic"
import { skipToken } from '@reduxjs/toolkit/query/react'

interface OptionType {
	label: string
	value: string
}

interface AsyncSelectProps {
	endpoint: string
	urlParams: Record<string, any>
	onSelect: (selectedOption: OptionType | null) => void
}

export const AsyncSelect = ({ endpoint, onSelect, urlParams }: AsyncSelectProps ) => {
	const [searchTerm, setSearchTerm] = useState("")

	// skip initial fetch when the searchTerm is empty
	// const { data, isFetching } = useGenericFetchQuery(searchTerm !== "" ? {
	// 	endpoint,
	// 	urlParams
	// } : skipToken)
	const { data, isFetching } = useGenericFetchQuery({
		endpoint,
		urlParams
	})

	const handleInputChange = (newValue: string) => {
		const inputValue = newValue.trim()
		setSearchTerm(inputValue)
		return inputValue
	}

	const handleChange = useCallback(
		(selectedOption: OptionType | null) => {
			onSelect(selectedOption)
		}, [onSelect]
	)

	return (
		<Select
			isLoading={isFetching}
			options={data?.data ?? []}
			onInputChange={handleInputChange}
			onChange={handleChange}
			placeholder={"Search"}
			isClearable
		/>
	)

}