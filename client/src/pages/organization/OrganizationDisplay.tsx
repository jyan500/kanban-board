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
import { ORGANIZATION, ORGANIZATION_ADD_EDIT_STATUSES, USERS} from "../../helpers/routes"
import { Avatar } from "../../components/page-elements/Avatar"
import { toggleShowModal, setModalType } from "../../slices/modalSlice"
import { EditImageIndicator } from "../../components/page-elements/EditImageIndicator"
import { ProfileCard } from "../../components/page-elements/ProfileCard" 
import { SettingsCard } from "../../components/page-elements/SettingsCard" 
import { TwoColumnLoading } from "../../components/page-elements/TwoColumnLoading"

export const OrganizationDisplay = () => {
	const dispatch = useAppDispatch()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { data: organization, isLoading} = useGetOrganizationQuery(userProfile?.organizationId ?? skipToken)
	const [uploadImage, setUploadImage] = useState(false)
	const links = [
		{
			text: "Organization",
			link: ORGANIZATION
		},
		{
			text: "Add/Edit Statuses",
			link: ORGANIZATION_ADD_EDIT_STATUSES
		},
		{
			text: "Users",
			link: USERS
		}
	]
	return (
		<div>
			<div className = "tw-flex tw-flex-col tw-w-full tw-gap-y-6 lg:tw-flex-row lg:tw-gap-x-6">
				{!isLoading && organization ? 
					<>
						<div className = "lg:tw-w-1/4 tw-flex tw-flex-col tw-gap-y-4">
							<div className = "tw-w-full tw-flex tw-flex-col tw-gap-y-4">
								<>
									<ProfileCard isOrg={true} entityId={organization.id} imageUploadUrl={`${ORGANIZATION_URL}/image`} imageUrl={organization.imageUrl} invalidatesTags={["Organizations"]}>
									<>
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
									</>
									</ProfileCard>
									<SettingsCard title={"Organization Settings"} links={links}/>					
								</>
							</div>
						</div>
						<div className = "lg:tw-w-1/2 tw-w-full tw-flex tw-flex-col tw-gap-y-2">
							<Outlet/>
						</div>
					</>
				: <TwoColumnLoading/>
				}
			</div>
		</div>
	)
}
