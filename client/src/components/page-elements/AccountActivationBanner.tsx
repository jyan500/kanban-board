import React from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { Link } from "react-router-dom"
import { Banner } from "./Banner"
import { useActivateAccountMutation } from "../../services/private/userProfile"
import { Toast } from "../../types/common"
import { v4 as uuidv4 } from "uuid"
import { addToast } from "../../slices/toastSlice"


export const AccountActivationBanner = () => {
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const dispatch = useAppDispatch()
	const [ activateAccount, {isLoading, error}] = useActivateAccountMutation()

	const onClick = async () => {
		const defaultToast: Toast = {
			id: uuidv4(),
			message: "Something went wrong when activating account",
			animationType: "animation-in",
			type: "failure",
		}
		try {
			await activateAccount().unwrap()
			dispatch(addToast({
				...defaultToast,
				message: "Account activated successfully!",
				type: "success"
			}))

		}
		catch (e){
			dispatch(addToast(defaultToast))
		}
	}

	return (
		<Banner type="warning" message="Your account is not activated yet!">
			<div>
				<small>Certain features will not be available until your account is activated.</small>	
				<button className = "tw-font-semibold" onClick={onClick}>Activate Here</button>
			</div>
		</Banner>
	)	
}
