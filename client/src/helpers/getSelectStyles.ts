import { StylesConfig, ClassNamesConfig, GroupBase } from 'react-select'
import { OptionType } from "../types/common"
import { SELECT_Z_INDEX } from './constants'

// Define your option type (adjust based on your actual option structure)
interface GetSelectStylesParams {
    isDarkMode: boolean
    textColor?: string
    textAlign?: string
    className?: string
    hideIndicatorSeparator?: boolean
}

export const getSelectStyles = ({
    isDarkMode,
    textColor = 'inherit',
    textAlign = 'left',
    className = 'tw-w-full',
    hideIndicatorSeparator = false,
}: GetSelectStylesParams): {
    classNames: ClassNamesConfig<OptionType, false, GroupBase<OptionType>>
    styles: StylesConfig<OptionType, false, GroupBase<OptionType>>
} => {

    return {
        classNames: {
            control: (state) => `${className} ${SELECT_Z_INDEX} dark:!tw-bg-gray-800 dark:!tw-border-gray-600`,
            menu: (base) => `dark:!tw-bg-gray-800`,
            placeholder: (base) => `dark:!tw-text-gray-200`,
        },
        styles: {
            control: (baseStyles, state) => ({
                ...baseStyles,
                height: "43px",
                padding: ".1em",
                textAlign: textAlign as any,
            }),
            option: (provided, state) => ({
                ...provided,
                color: isDarkMode
                    ? (state.isFocused ? '#f9fafb' : '#e5e7eb')
                    : (state.isFocused ? '#111827' : '#374151'),
                backgroundColor: isDarkMode
                    ? (state.isFocused ? '#374151' : '#1f2937')
                    : (state.isFocused ? '#f3f4f6' : 'white'),
                cursor: 'pointer',
            }),
            singleValue: (base) => ({
                ...base,
                color: isDarkMode ? "white" : "black",
            }),
            placeholder: (base) => ({
                ...base,
                color: isDarkMode ? "white": "black",
                textAlign: textAlign as any,
            }),
            dropdownIndicator: (provided) => ({
                ...provided,
                'svg': {
                    fill: isDarkMode ? "white" : "black",
                },
            }),
            valueContainer: (provided) => ({
                ...provided,
                textAlign: textAlign as any,
            }),
            indicatorSeparator: () => ({
                display: hideIndicatorSeparator ? 'none' : 'block',
                'svg': {
                    fill: isDarkMode ? "white": "black"
                }
            }),
        },
    }
}