import React, {useState, useRef, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useNavigate, useLocation, Link } from "react-router-dom" 
import { useGetUserOrganizationsQuery, useSwitchUserOrganizationMutation } from "../../services/private/userProfile"
import { useGetTicketsQuery } from "../../services/private/ticket"
import { Ticket, Organization, Toast, OptionType, ProgressBarPercentage } from "../../types/common"
import { setCredentials } from "../../slices/authSlice"
import { logout } from "../../slices/authSlice" 
import { privateApi } from "../../services/private" 
import { addToast } from "../../slices/toastSlice"
import { GroupBase, SelectInstance } from "react-select"
import { v4 as uuidv4 } from "uuid" 
import { USER_PROFILE_ORG_URL } from "../../helpers/urls"
import { AsyncSelect } from "../AsyncSelect"
import { skipToken } from '@reduxjs/toolkit/query/react'

export const SwitchOrganizationForm = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const location = useLocation()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const [cacheKey, setCacheKey] = useState(uuidv4())
	const [switchUserOrganization, {isLoading, error}] = useSwitchUserOrganizationMutation()
	const [switchOrgId, setSwitchOrgId] = useState<number | null>(null)
	const selectRef = useRef<SelectInstance<OptionType, false, GroupBase<OptionType>>>(null) 
	const switchOrganization = async () => {
		if (switchOrgId){
			try {
				const data = await switchUserOrganization({organizationId: switchOrgId}).unwrap()
				dispatch(setCredentials(data))
				dispatch(privateApi.util.resetApiState())
	    		navigate("/", {state: {type: "success", alert: "You have switched organizations!"}, replace: true})
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
		<>
			<p className = "tw-font-medium">{userProfile?.organizationName}</p>
			<div className = "tw-flex tw-flex-col tw-gap-y-2">
				<AsyncSelect 
					ref={selectRef}
					cacheKey={cacheKey} 
					urlParams={{excludeOwn: true}} 
					onSelect={(selectedOption: OptionType | null) => {
						if (selectedOption){
							setSwitchOrgId(Number(selectedOption.value))
						}
					}} 
					endpoint={USER_PROFILE_ORG_URL} 
					className = "tw-w-full"
				/>
				<div>
					<button onClick={switchOrganization} className = "button">Switch Organization</button>
				</div>
			</div>
		</>
	)	
}
