import React, { useState, useCallback, useEffect } from "react"
import { AsyncPaginate } from 'react-select-async-paginate';
import { useLazyGenericFetchQuery } from "../services/private/generic"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { ListResponse, OptionType } from "../types/common"
import { OptionsOrGroups, GroupBase, SelectInstance, MultiValue, ActionMeta } from "react-select"
import { MD_BREAKPOINT, SELECT_Z_INDEX } from "../helpers/constants"
import { useScreenSize } from "../hooks/useScreenSize";

export interface LoadOptionsType {
	options: ListResponse<any>
	hasMore: boolean
	additional: {
		page: number
	}
}

interface AsyncMultiSelectProps {
	id?: string
	endpoint: string
	defaultValue?: MultiValue<OptionType>
	clearable?: boolean
	onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
	className?: string 
	urlParams: Record<string, any>
	cacheKey?: string
	onSelect: (selectedOption: MultiValue<OptionType>) => void
}


export const AsyncMultiSelect = React.forwardRef<SelectInstance<OptionType, true, GroupBase<OptionType>>, AsyncMultiSelectProps>((
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
	const [val, setVal] = useState<MultiValue<OptionType>>(defaultValue ?? [])
	const [ genericFetch ] = useLazyGenericFetchQuery()
	const { width, height } = useScreenSize()

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
		(selectedOption: MultiValue<OptionType>, actionMeta: ActionMeta<OptionType>) => {
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
			    control: (state) => `${className ?? "tw-w-full"} ${SELECT_Z_INDEX}`
			}}
			styles={{
				valueContainer: (base) => ({
					...base,
					flexWrap: "wrap",
					gap: "4px",
				}),
			    control: (baseStyles, state) => ({
					...baseStyles,
					height: "auto",
					minHeight: "44px",
					border: "var(--width-input-border) solid var(--bs-light-gray)",
					padding: ".1em",
			    }),
				multiValue: (base) => ({
					...base,
					fontSize: width < MD_BREAKPOINT ? '12px' : '14px',
					padding: width < MD_BREAKPOINT ? '2px 6px' : '5px 8px',
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
			isMulti={true}
		/>
	)
})
