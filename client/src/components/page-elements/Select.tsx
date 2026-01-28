import React, { useState, useCallback, useEffect } from "react"
import {default as ReactSelect} from "react-select"
import { OptionType } from "../../types/common"
import { SELECT_Z_INDEX } from "../../helpers/constants"

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
			    control: (state) => `${className ?? "tw-w-full"} ${SELECT_Z_INDEX}`
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
						fill: textColor,
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