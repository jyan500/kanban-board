import { useState } from "react";

interface Props {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void 
    checked: boolean
}

export const Switch = ({onChange, checked}: Props) => {
    return (
        <label className="tw-relative tw-inline-flex tw-items-center tw-cursor-pointer">
            <input
                type="checkbox"
                /* sr-only hides element visually but not from screen readers */
                className="tw-sr-only tw-peer"
                checked={checked}
                onChange={onChange}
            />
                {/* switch body */}
                <div className="tw-w-10 tw-h-5 tw-bg-gray-300 peer-checked:tw-bg-primary tw-rounded-full tw-transition-colors"></div>
                {/* slider circle element */}
                <div
                className={`tw-absolute tw-left-1 tw-top-1 tw-w-3 tw-h-3 tw-bg-white tw-rounded-full tw-transition-transform ${
                checked ? "tw-translate-x-5" : "tw-translate-x-0"
                }`}
            />
        </label>
    )
}
