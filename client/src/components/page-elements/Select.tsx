import React, { useState, useCallback, useEffect } from "react"
import {default as ReactSelect} from "react-select"
import { OptionType } from "../../types/common"
import { SELECT_Z_INDEX } from "../../helpers/constants"
import { useAppSelector } from "../../hooks/redux-hooks"

interface Props {
	id?: string
    options: Array<OptionType>
	defaultValue?: OptionType | null 
    className?: string
    clearable?: boolean
	textAlign?: "left" | "center" | "right"
	textColor?: string
	hideIndicatorSeparator?: boolean
	searchable?: boolean
	onBlur?: () => void
	onSelect: (selectedOption: OptionType | null) => void
}

export const Select = ({
	id,
    options, 
    defaultValue,
    clearable,
	searchable=false,
	hideIndicatorSeparator=false,
	textColor="black",
	textAlign="left",
    className,
    onSelect,
	onBlur,
}: Props) => {
    const [searchTerm, setSearchTerm] = useState("")
	const [val, setVal] = useState<OptionType | null>(defaultValue ?? null)
	const { isDarkMode } = useAppSelector((state) => state.darkMode)

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
        <ReactSelect
			inputId={id}
            options={options}
            value={defaultValue}
			onBlur={onBlur}
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
				  textAlign: textAlign,
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
					color: textColor, 
				}),
				placeholder: (base) => ({
					...base,
					color: textColor,
					textAlign: textAlign,
				}),
				dropdownIndicator: (provided) => ({
					...provided,
					'svg': {
						fill: (isDarkMode ? "white" : "black"),
					},
				}),
				valueContainer: (provided) => ({
					...provided,
					textAlign: textAlign, // Ensures the selected value aligns left
				}),
				indicatorSeparator: () => ({
					display: hideIndicatorSeparator ? 'none' : 'block',
				}),
			}}
			
			onChange={handleChange}
            isClearable={clearable ?? true}
			isSearchable={searchable ?? true}
            getOptionLabel={(option) => option.label}
			getOptionValue={(option) => option.value}
        />
    )
}