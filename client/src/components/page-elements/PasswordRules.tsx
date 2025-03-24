import { useState } from "react";
import { IconCircleCheckmark } from "../icons/IconCircleCheckmark"
import { IconClose } from "../icons/IconClose"

interface PasswordRulesProps {
    password: string
}

export const PasswordRules = ({ password }: PasswordRulesProps) => {
    // Define password rules
    const rules = [
        { id: 1, text: "At least 6 characters", valid: password.length >= 6 },
        { id: 2, text: "At least one uppercase letter", valid: /[A-Z]/.test(password) },
        { id: 3, text: "At least one lowercase letter", valid: /[a-z]/.test(password) },
        { id: 4, text: "At least one number", valid: /\d/.test(password) },
        { id: 5, text: "At least one special character (!@#$%^&*)", valid: /[!@#$%^&*]/.test(password) },
    ]

    return (
        <div className="tw-mt-2 tw-text-sm">
            {rules.map((rule) => (
                <div key={rule.id} className={`tw-flex tw-items-center ${rule.valid ? "tw-text-success" : "tw-text-gray-500"}`}>
                    {rule.valid ? <IconCircleCheckmark color="var(--bs-success)"/> : <IconClose color = "var(--bs-danger)"/>} <span className="tw-ml-2">{rule.text}</span>
                </div>
            ))}
        </div>
    )
}
