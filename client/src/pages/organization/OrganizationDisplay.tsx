import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { Link, Outlet, useParams } from "react-router-dom" 
import { Table } from "../../components/Table" 
import { EditUserForm } from "../../components/EditUserForm"
import { displayUser } from "../../helpers/functions"
import { CgProfile } from "react-icons/cg"
import { FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaRegBuilding } from "react-icons/fa";
import { FaBuilding } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { FaPhone } from "react-icons/fa6";
import { MdFactory } from "react-icons/md";
import { useGetOrganizationQuery } from "../../services/private/organization" 
import { skipToken } from '@reduxjs/toolkit/query/react'
import { LoadingSpinner } from "../../components/LoadingSpinner" 
import { OrganizationForm } from "../../components/OrganizationForm"
import { UploadImageForm } from "../../components/UploadImageForm"
import { ORGANIZATION_URL } from "../../helpers/urls"
import { Avatar } from "../../components/page-elements/Avatar"

export const OrganizationDisplay = () => {
	const dispatch = useAppDispatch()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { data: organization, isLoading} = useGetOrganizationQuery(userProfile?.organizationId ?? skipToken)
	const [uploadImage, setUploadImage] = useState(false)
	return (
		<div>
			<div className = "tw-flex tw-flex-row tw-gap-x-6">
				{organization ? 
					<>
						<div className = "tw-p-4 tw-border tw-border-gray-300 tw-shadow tw-rounded-md tw-flex tw-flex-col tw-items-center tw-gap-y-2">
							{/*<FaRegBuilding className = "tw-w-32 tw-h-32"/>*/}
							<Avatar size = "l" imageUrl={organization.imageUrl}/>
							<div className = "tw-flex tw-flex-col tw-gap-y-2">
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
									<FaBuilding className = "--icon tw-mt-1"/>
									<div>{organization?.name}</div>	
								</div>
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
									<FaLocationDot className = "--icon tw-mt-1"/>
									<div>{`${organization?.address && organization?.city && organization?.state && organization?.zipcode ? `${organization?.address}, ${organization?.city}, ${organization?.state} ${organization?.zipcode}` : ""}`}</div>	
								</div>
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
									<FaPhone className = "--icon tw-mt-1"/>
									<div>{organization?.phoneNumber}</div>	
								</div>
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
									<MdEmail className = "--icon tw-mt-1"/>
									<div>{organization?.email}</div>	
								</div>
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
									<MdFactory className = "--icon tw-mt-1"/>
									<div>{organization?.industry}</div>	
								</div>
								<button className = "button" onClick={() => setUploadImage(!uploadImage)}>{uploadImage ? "Hide " : ""}{organization.imageUrl ? "Change " : "Upload "}Image</button>
								{uploadImage ? (
									<UploadImageForm id={organization.id} endpoint={`${ORGANIZATION_URL}/image`} imageUrl={organization.imageUrl} invalidatesTags={["Organizations"]}/> 
								) : null}
							</div>
						</div>
						<div className = "tw-flex tw-flex-col tw-gap-y-2">
							<div className = "tw-w-1/2">
								<h1>Organization</h1>
								<OrganizationForm organization={organization}/>
							</div>
						</div>
					</>
				: null
				}
			</div>
		</div>
	)
}
