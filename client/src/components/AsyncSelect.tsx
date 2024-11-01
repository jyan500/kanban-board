import React, { useState, useCallback } from "react"
// import Select from "react-select"
import { AsyncPaginate } from 'react-select-async-paginate';
import { useLazyGenericFetchQuery } from "../services/private/generic"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { ListResponse, OptionType } from "../types/common"
import { OptionsOrGroups, GroupBase, SelectInstance } from "react-select"


interface LoadOptionsType {
	options: ListResponse<any>
	hasMore: boolean
	additional: {
		page: number
	}
}

interface AsyncSelectProps {
	endpoint: string
	className?: string 
	urlParams: Record<string, any>
	onSelect: (selectedOption: OptionType | null) => void
}

export const AsyncSelect = React.forwardRef<SelectInstance<OptionType, false, GroupBase<OptionType>>, AsyncSelectProps>(({ className, endpoint, onSelect, urlParams }, ref) => {
	const [searchTerm, setSearchTerm] = useState("")
	const [ genericFetch ] = useLazyGenericFetchQuery()

	const loadOptions = async (
		query: string, 
		loadedOptions: OptionsOrGroups<OptionType, GroupBase<OptionType>>, 
		additional: {page: number} | undefined) => {
		const {data, pagination} = await genericFetch({
			endpoint,
			urlParams: {...urlParams, query: query, page: additional?.page ? additional.page : 1},
		}).unwrap()

		if (!data) {
			return {
				options: [],
				hasMore: false,
				additional: {page: 1}
			}
		}
		const options = [...data]
		const next = {
			options,
			hasMore: pagination.currentPage !== pagination.lastPage, 
			...(additional ? {additional: {page: additional?.page ? additional?.page + 1 : 1}} : {})
		}
		return next
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
		<AsyncPaginate
			selectRef={ref}
			loadOptions={loadOptions}
			onInputChange={handleInputChange}
			additional={{page: 1}}
			styles={{
			    control: (baseStyles, state) => ({
			      ...baseStyles,
			      border: "var(--width-input-border) solid var(--co-textfld-border)",
			      padding: ".1em",
			      width: "100%"
			    }),
			}}
			onChange={handleChange}
			getOptionLabel={(option) => option.label}
			getOptionValue={(option) => option.value}
			placeholder="Search"
			// wait milliseconds amount after user stops typing before searching
			debounceTimeout={300}
			isClearable
			menuShouldScrollIntoView={false}
		/>
	)
})
