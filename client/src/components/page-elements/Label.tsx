import React from 'react'
import { SECONDARY_TEXT } from '../../helpers/constants'

interface Props extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode
}

export const Label = ({ children, className, ...props }: Props) => {
    return (
        <label 
            className={`${className} tw-font-semibold ${SECONDARY_TEXT}`}
            {...props}
        >
            {children}
        </label>
    )
}
