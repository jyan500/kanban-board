import React, { useState, useCallback, useEffect } from "react"
import {default as ReactSelect} from "react-select"
import { OptionType } from "../../types/common"
import { SELECT_Z_INDEX } from "../../helpers/constants"
import { useAppSelector } from "../../hooks/redux-hooks"
import { getSelectStyles } from "../../helpers/getSelectStyles"

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
	textColor="inherit",
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

	const { classNames, styles } = getSelectStyles({
        isDarkMode,
        textColor,
        textAlign,
        className,
        hideIndicatorSeparator: true,
    })

    return (
        <ReactSelect
			inputId={id}
            options={options}
            value={defaultValue}
			onBlur={onBlur}
            classNames={classNames}
			styles={styles}
			onChange={handleChange}
            isClearable={clearable ?? true}
			isSearchable={searchable ?? true}
            getOptionLabel={(option) => option.label}
			getOptionValue={(option) => option.value}
        />
    )
}