import React, {useState, useRef, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import "../styles/dashboard.css"
import { useNavigate, Link } from "react-router-dom" 
import { useGetUserOrganizationsQuery, useSwitchUserOrganizationMutation } from "../services/private/userProfile"
import { Organization, Toast, OptionType } from "../types/common"
import { setCredentials } from "../slices/authSlice"
import { logout } from "../slices/authSlice" 
import { privateApi } from "../services/private" 
import { addToast } from "../slices/toastSlice"
import { v4 as uuidv4 } from "uuid" 
import { AsyncSelect } from "./AsyncSelect"
import { GroupBase, SelectInstance } from "react-select"
import { USER_PROFILE_ORG_URL } from "../helpers/urls"

export const Dashboard = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [switchOrgId, setSwitchOrgId] = useState<number | null>(null)
	const [cacheKey, setCacheKey] = useState(uuidv4())
	const [switchUserOrganization, {isLoading, error}] = useSwitchUserOrganizationMutation()
	const selectRef = useRef<SelectInstance<OptionType, false, GroupBase<OptionType>>>(null) 

	const switchOrganization = async () => {
		if (switchOrgId){
			try {
				const data = await switchUserOrganization({organizationId: switchOrgId}).unwrap()
				dispatch(setCredentials(data))
				
				dispatch(privateApi.util.resetApiState())
				dispatch(addToast({
	    			id: uuidv4(),
	    			type: "success",
	    			animationType: "animation-in",
	    			message: "Switched organization successfully!",
	    		}))
			}
			catch (e){
				dispatch(addToast({
	    			id: uuidv4(),
	    			type: "failure",
	    			animationType: "animation-in",
	    			message: "Failed to switch organization.",
	    		}))
			}
		}
		selectRef?.current?.clearValue()
		setCacheKey(uuidv4())
	}

	return (
		<div className = "tw-flex tw-flex-row tw-justify-between tw-h-full tw-gap-x-2">
			<div className = "tw-flex tw-flex-col tw-gap-y-2">
				<h1>Organizations</h1>
				<div>
					<AsyncSelect 
						ref={selectRef}
						cacheKey={cacheKey} 
						urlParams={{}} 
						onSelect={(selectedOption: OptionType | null) => {
							if (selectedOption){
								setSwitchOrgId(Number(selectedOption.value))
							}
						}} 
						endpoint={USER_PROFILE_ORG_URL} 
						className = "tw-w-64"
					/>
				</div>
				<button onClick={switchOrganization} className = "button">Switch Organization</button>
			</div>
			<div className = "tw-flex tw-flex-col tw-gap-y-2">
				<h1>Assigned To Me</h1>
			</div>
			<div className = "tw-flex tw-flex-col tw-gap-y-2">
				<h1>Watched Tickets</h1>
			</div>
		</div>
	)	
}