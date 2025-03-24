import React, {useState, useEffect} from "react"
import { useForm, Controller } from "react-hook-form"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { AsyncSelect } from "../../components/AsyncSelect"
import { useAddRegistrationRequestMutation } from "../../services/private/organization"
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4} from "uuid"
import { USER_PROFILE_URL, USER_PROFILE_ORG_URL } from "../../helpers/urls"
import { OptionType, Toast } from "../../types/common"
import { useNavigate, Navigate } from "react-router-dom" 
import { LoadingSpinner } from "../../components/LoadingSpinner"

type FormValues = {
	organizationId: string | number 
}

export const JoinOrganization = () => {
	const dispatch = useAppDispatch()
	const defaultForm: FormValues = {
		organizationId: ""
	}
	const registerOptions = {
		organizationId: {required: "Organization is required"}
	}
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register, control, handleSubmit, reset , setValue, getValues, formState: {errors} } = useForm<FormValues>({defaultValues: preloadedValues})
	const [addRegistrationRequest, {isLoading, error}] = useAddRegistrationRequestMutation()
	const { userProfile } = useAppSelector((state) => state.userProfile)

	const onSubmit = async (values: FormValues) => {
		const defaultToast: Toast = {
			id: uuidv4(),
			type: "success",
			animationType: "animation-in",
			message: "Registration request entered successfully. You will be notified when your registration request is accepted."
		}
		try {
			await addRegistrationRequest({
				organizationId: !isNaN(Number(values.organizationId)) ? Number(values.organizationId) : 0
			}).unwrap()
			dispatch(addToast(defaultToast))
		}
		catch (e){
			dispatch(addToast({
				...defaultToast,
				type: "failure",
				message: "Registration request could not entered."
			}))
		}
	}
	return (
		<div className = "tw-w-1/2">
			<h1>Join Organization</h1>	
			<form onSubmit={handleSubmit(onSubmit)} className = "tw-flex tw-flex-col tw-gap-y-2">
				 <div>
				    <label className = "label" htmlFor = "join-organization">
				    	Organization:
				    </label>
					<Controller
						name={"organizationId"}
						control={control}
						rules={registerOptions.organizationId}
						render={({field: {onChange, value, name, ref}}) => (
							<AsyncSelect 
								urlParams={{getJoinedOrgs: false}} 
								onSelect={(selectedOption: OptionType | null) => {
			                		const val = selectedOption?.value ?? ""
									setValue("organizationId", Number(val))
								}} 
								endpoint={USER_PROFILE_ORG_URL} 
								className = "tw-w-full"
							/>
						)}
					/>
			        {errors?.organizationId && <small className = "--text-alert">{errors.organizationId.message}</small>}
			    </div>	
			    <div>
			    	<button className = "button" type="submit">Send Request</button>
			    </div>
			</form>
		</div>
	)	
}
