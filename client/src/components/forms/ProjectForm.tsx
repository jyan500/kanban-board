import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { toggleShowModal } from "../../slices/modalSlice"
import { useAddProjectMutation, useGetProjectQuery, useUpdateProjectMutation } from "../../services/private/project"
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid"
import { addToast } from "../../slices/toastSlice"
import { LoadingButton } from "../page-elements/LoadingButton"
import { Project, OptionType, UserProfile } from "../../types/common"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { ProfileCard } from "../page-elements/ProfileCard"
import { PROJECT_URL } from "../../helpers/urls"
import { AsyncSelect } from "../AsyncSelect"
import { Controller } from "react-hook-form"
import { USER_PROFILE_URL } from "../../helpers/urls"
import { displayUser } from "../../helpers/functions"
import { useGetUserQuery } from "../../services/private/userProfile"
import { LoadingSpinner } from "../LoadingSpinner"

type FormValues = {
	id?: number
	name: string
	description?: string
	imageUrl?: string
	userIdOption: OptionType
}

interface ProjectFormProps {
    projectId?: number
}

export const ProjectForm = ({ projectId }: ProjectFormProps) => {
	const dispatch = useAppDispatch()
	const { showModal } = useAppSelector((state) => state.modal)
	const defaultForm: FormValues = {
		id: undefined,
		name: "",
		description: "",
		imageUrl: "",
		userIdOption: {label: "", value: ""}
	}
	const [ addProject ] = useAddProjectMutation()
	const [ updateProject ] = useUpdateProjectMutation()
	const { data: projectInfo, isLoading: isGetProjectDataLoading } = useGetProjectQuery(projectId ? {id: projectId, urlParams: {}} : skipToken)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { data: owner, isLoading: isOwnerLoading } = useGetUserQuery(projectInfo?.userId ?? skipToken)
	const [ preloadedValues, setPreloadedValues ] = useState<FormValues>(defaultForm)
	const { register, handleSubmit, reset, setValue, watch, getValues, control, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})
	const [ submitLoading, setSubmitLoading ] = useState(false)
	const registerOptions = {
	    name: { required: "Name is required" },
	    userIdOption: { /* Owner is optional */ }
	}

	useEffect(() => {
		// initialize with current values if the project exists
		if (projectId && projectInfo){
			reset({id: projectId, name: projectInfo.name, description: projectInfo.description, imageUrl: projectInfo.imageUrl})
		}
		else {
			reset(defaultForm)
		}
	}, [showModal, projectInfo, projectId])

	useEffect(() => {
		if (!isOwnerLoading && owner){
			setValue("userIdOption", {label: displayUser(owner), value: owner.id.toString()})
		}
	}, [isOwnerLoading, owner])

    const onSubmit = async (values: FormValues) => {
		setSubmitLoading(true)
    	try {
    		if (values.id != null && projectId){
				await updateProject({
					id: projectId,
					name: values.name,
					description: values.description,
					imageUrl: values.imageUrl,
					userId: !isNaN(parseInt(values.userIdOption.value)) ? parseInt(values.userIdOption.value) : 0
				}).unwrap()
    		}
    		else {
    			await addProject({
					name: values.name,
					description: values.description,
					imageUrl: values.imageUrl,
					userId: !isNaN(parseInt(values.userIdOption.value)) ? parseInt(values.userIdOption.value) : 0
				}).unwrap()
    		}
    		dispatch(toggleShowModal(false))
    		dispatch(addToast({
				id: uuidv4(),
				type: "success",
				animationType: "animation-in",
				message: `Project ${values.id != null ? "updated" : "added"} successfully!`,
    		}))
    	}
    	catch {
    		dispatch(addToast({
				id: uuidv4(),
				type: "failure",
				animationType: "animation-in",
				message: `Failed to ${values.id != null ? "update" : "add"} project.`,
    		}))
    	}
    	finally {
    		setSubmitLoading(false)
    	}
    }

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-max-w-3xl tw-mx-auto">
			<ProfileCard showUploadImage={true} entityId={projectId ?? 0} imageUrl={watch("imageUrl")} imageUploadUrl={`${PROJECT_URL}/image`} invalidatesTags={["Projects"]} onUploadSuccess={() => {
				// after an image is uploaded, prevent the owner field from being cleared out by explicitly setting the
				// user id while the project is invalidated and reloaded
				const currentUserIdOption = getValues("userIdOption");
				setValue("userIdOption", currentUserIdOption);
			}} />
			<form onSubmit={handleSubmit(onSubmit)} className = "tw-flex tw-flex-col tw-gap-y-2">
				{
					!isOwnerLoading ? 
					<div className = "tw-flex tw-flex-col">
						<label className = "label">Owner</label>
						<Controller
							name={"userIdOption"}
							control={control}
							rules={registerOptions.userIdOption}
							render={({ field: { onChange, value, name, ref } }) => (
								<AsyncSelect 
									endpoint={USER_PROFILE_URL} 
									clearable={true}
									defaultValue={watch("userIdOption") ?? null}
									urlParams={{forSelect: true}} 
									onSelect={async (selectedOption: OptionType | null) => {
										onChange(selectedOption)
									}}
								/>
							)}
						/>
						{errors?.userIdOption && <small className = "--text-alert">{errors.userIdOption.message}</small>}
					</div> : <LoadingSpinner/> 
				}
				<div className = "tw-flex tw-flex-col">
					<label className = "label" htmlFor = "project-name">Name</label>
					<input id = "project-name" type = "text"
					{...register("name", registerOptions.name)}
					className="tw-w-full"
					/>
					{errors?.name && <small className = "--text-alert">{errors.name.message}</small>}
				</div>
				<div className = "tw-flex tw-flex-col">
					<label className = "label" htmlFor = "project-description">Description</label>
					<textarea id = "project-description"
					{...register("description")}
					className="tw-w-full"
					/>
				</div>
				<div className = "tw-flex tw-flex-col">
					<LoadingButton isLoading={submitLoading} type="submit" text="Submit" className = "button"/>
				</div>
			</form>
		</div>
	)
}