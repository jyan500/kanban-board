import React, {useState, useRef, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useNavigate, useLocation, Link } from "react-router-dom" 
import { useGetUserOrganizationsQuery, useSwitchUserOrganizationMutation } from "../../services/private/userProfile"
import { useGetOrganizationQuery } from "../../services/private/organization"
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
import { Avatar } from "../page-elements/Avatar"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../placeholders/RowPlaceholder"
import { HOME } from "../../helpers/routes"
import { Button } from "../page-elements/Button"
import { Label } from "../page-elements/Label"
import { PRIMARY_TEXT } from "../../helpers/constants"

export const SwitchOrganizationForm = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const location = useLocation()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { data: organization, isLoading: isOrganizationLoading} = useGetOrganizationQuery(userProfile?.organizationId ?? skipToken)
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
	    		navigate(HOME, {state: {type: "success", alert: "You have switched organizations!"}, replace: true})
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
			{
			isOrganizationLoading ? 
				<LoadingSkeleton width="tw-w-full" height = "tw-h-84">
					<RowPlaceholder/>	
				</LoadingSkeleton> : (
					<div className="tw-flex tw-flex-col tw-gap-y-2">
						<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
							<Avatar isOrg={true} size = "s" className = {`${PRIMARY_TEXT} ${organization?.imageUrl ? "tw-rounded-full" : ""}`} imageUrl={organization?.imageUrl}/>
							<p className = {`${PRIMARY_TEXT} tw-font-medium`}>{userProfile?.organizationName}</p>
						</div>
						<div className = "tw-flex tw-flex-col tw-gap-y-4">
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
								<Button theme="primary" onClick={switchOrganization}>Switch Organization</Button>
							</div>
						</div>
					</div>
				)
			}
		</>
	)	
}
