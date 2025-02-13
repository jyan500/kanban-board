import React from "react"
import { CustomError, SerializedError } from "../../types/common"
import { v4 as uuidv4 } from "uuid"

type Props = {
	error: CustomError | SerializedError | undefined
}

export const BackendErrorMessage = ({error}: Props) => {
	return (
		<>
			{error && "status" in error ? (error.data.errors?.map((errorMessage: string) => <p className = "--text-alert" key = {uuidv4()}>{errorMessage}</p>)) : <></>}
		</>
	)
}
