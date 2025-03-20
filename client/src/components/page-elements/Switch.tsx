import { useState } from "react";

export const Switch = () => {
    const [enabled, setEnabled] = useState(false);

    return (
        <label className="tw-relative tw-inline-flex tw-items-center tw-cursor-pointer">
            <input
                type="checkbox"
                /* sr-only hides element visually but not from screen readers */
                className="tw-sr-only tw-peer"
                checked={enabled}
                onChange={() => setEnabled(!enabled)}
            />
                <div className="tw-w-10 tw-h-5 tw-bg-gray-300 peer-checked:tw-bg-sky-500 tw-rounded-full tw-transition-colors"></div>
                <div
                className={`tw-absolute tw-left-1 tw-top-1 tw-w-3 tw-h-3 tw-bg-white tw-rounded-full tw-transition-transform ${
                enabled ? "tw-translate-x-5" : "tw-translate-x-0"
                }`}
            />
        </label>
    )
}
