import React, { useState, useCallback, useEffect } from "react"
import {default as ReactSelect} from "react-select"
import { OptionType } from "../../types/common"
import { SELECT_Z_INDEX } from "../../helpers/constants"

interface Props {
    options: Array<OptionType>
	defaultValue?: OptionType | null 
    className?: string
    clearable?: boolean
	onBlur?: () => void
	onSelect: (selectedOption: OptionType | null) => void
}

export const Select = ({
    options, 
    defaultValue,
    clearable,
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
			    }),
			}}
			onChange={handleChange}
            isClearable={clearable ?? true}
            getOptionLabel={(option) => option.label}
			getOptionValue={(option) => option.value}
        />
    )
}