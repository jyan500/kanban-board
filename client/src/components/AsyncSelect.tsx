import React, { useState, useCallback } from "react"
// import Select from "react-select"
import type { GroupBase, OptionsOrGroups } from "react-select";
import { AsyncPaginate } from 'react-select-async-paginate';
import { useLazyGenericFetchQuery } from "../services/private/generic"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { ListResponse } from "../types/common"

interface OptionType {
	label: string
	value: string
}

interface LoadOptionsType {
	options: ListResponse<any>
	hasMore: boolean
	additional: {
		page: number
	}
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
	const [ genericFetch ] = useLazyGenericFetchQuery()


	const loadOptions = async (
		query: string, 
		loadedOptions: OptionsOrGroups<OptionType, GroupBase<OptionType>>, 
		additional: {page: number} | undefined) => {
		const {data, pagination} = await genericFetch({
			endpoint,
			urlParams: {...urlParams, query: query},
		}).unwrap()
		console.log("data: ", data)

		if (!data) {
			return {
				options: [],
				hasMore: false,
			}
		}
		// merge newly fetched options with already loaded options
		// const options = [...loadedOptions, ...data?.data]
		const options = [...loadedOptions, ...data]
		return {
			options,
			hasMore: pagination.nextPage != null, 
			...(additional ? {page: pagination.nextPage} : {})
		}
	}

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
		// <Select
		// 	isLoading={isFetching}
		// 	options={data?.data ?? []}
		// 	onInputChange={handleInputChange}
		// 	onChange={handleChange}
		// 	placeholder={"Search"}
		// 	isClearable
		// />
		<AsyncPaginate
			loadOptions={loadOptions}
			onInputChange={handleInputChange}
			onChange={handleChange}
			getOptionLabel={(option) => option.label}
			getOptionValue={(option) => option.value}
			placeholder="Search"
			// wait milliseconds amount after using stops typing before searching
			debounceTimeout={300}
			isClearable
		/>
	)

}