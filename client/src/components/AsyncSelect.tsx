import React, { useState, useCallback, useEffect } from "react"
import { AsyncPaginate } from 'react-select-async-paginate';
import { useLazyGenericFetchQuery } from "../services/private/generic"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { ListResponse, OptionType } from "../types/common"
import { OptionsOrGroups, GroupBase, SelectInstance } from "react-select"
import { v4 as uuidv4 } from "uuid"
import { SELECT_Z_INDEX } from "../helpers/constants"
import { useAppSelector } from "../hooks/redux-hooks"

export interface LoadOptionsType {
	options: ListResponse<any>
	hasMore: boolean
	additional: {
		page: number
	}
}

interface AsyncSelectProps {
	id?: string
	endpoint: string
	defaultValue?: OptionType | null 
	clearable?: boolean
	onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
	className?: string 
	urlParams: Record<string, any>
	cacheKey?: string
	onSelect: (selectedOption: OptionType | null) => void
}


export const AsyncSelect = React.forwardRef<SelectInstance<OptionType, false, GroupBase<OptionType>>, AsyncSelectProps>((
	{ 
		id, 
		cacheKey, 
		clearable, 
		className, 
		defaultValue, 
		endpoint, 
		onSelect, 
		urlParams, 
		onBlur 
	}, ref) => {
	const [searchTerm, setSearchTerm] = useState("")
	const [val, setVal] = useState<OptionType | null>(defaultValue ?? null)
	const [ genericFetch ] = useLazyGenericFetchQuery()
	const { isDarkMode } = useAppSelector((state) => state.darkMode)

	const loadOptions = async (
		query: string, 
		loadedOptions: OptionsOrGroups<OptionType, GroupBase<OptionType>>, 
		additional: {page: number} | undefined) => {
		try {
			const {data, pagination} = await genericFetch({
				endpoint,
				urlParams: {...urlParams, query: query, page: additional?.page ? additional.page : 1},
			}).unwrap()

			if (!data.length) {
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
		catch (e){
			return {
				options: [],
				hasMore: false,
				additional: {page: 1}
			}	
		}
	}

	const handleInputChange = (newValue: string) => {
		const inputValue = newValue.trim()
		setSearchTerm(inputValue)
		return inputValue
	}

	const handleChange = useCallback(
		(selectedOption: OptionType | null) => {
			setVal(selectedOption)
			onSelect(selectedOption)
		}, [onSelect]
	)

	return (
		<AsyncPaginate
			inputId={id}
			selectRef={ref}
			loadOptions={loadOptions}
			value={defaultValue}
			onInputChange={handleInputChange}
			onBlur={onBlur}
			additional={{page: 1}}
			classNames={{
			    control: (state) => `${className ?? `tw-w-full `} ${SELECT_Z_INDEX} dark:!tw-bg-gray-800`,
				menu: (base) => `dark:!tw-bg-gray-800`,
				placeholder: (base) => `dark:!tw-text-gray-200`
			}}
			styles={{
			    control: (baseStyles, state) => ({
			      ...baseStyles,
			      height: "43px",
			      border: "var(--width-input-border) solid var(--bs-light-gray)",
			      padding: ".1em",
			    }),
				// styles selected text and placeholder
				option: (provided, state) => ({
					...provided,
					color: isDarkMode
					  ? (state.isFocused ? '#f9fafb' : '#e5e7eb') // gray-50 : gray-200
					  : (state.isFocused ? '#111827' : '#374151'), // gray-900 : gray-700
					backgroundColor: isDarkMode
					  ? (state.isFocused ? '#374151' : '#1f2937') // gray-700 : gray-800
					  : (state.isFocused ? '#f3f4f6' : 'white'), // gray-100 : white
					cursor: 'pointer',
				}),
				singleValue: (base) => ({
					...base,
				}),
				placeholder: (base) => ({
					...base,
				}),
				dropdownIndicator: (provided) => ({
					...provided,
					'svg': {
						fill: (isDarkMode ? "white" : "black"),
					},
				}),
				valueContainer: (provided) => ({
					...provided,
				}),
			}}
			onChange={handleChange}
			getOptionLabel={(option) => option.label}
			getOptionValue={(option) => option.value}
			placeholder="Search"
			// wait milliseconds amount after user stops typing before searching
			debounceTimeout={300}
			isClearable={clearable ?? true}
			cacheUniqs={[cacheKey ?? ""]}
			menuShouldScrollIntoView={false}
		/>
	)
})
