import React, { useRef, useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { toggleShowModal } from "../../slices/modalSlice"
import { GroupBase, SelectInstance, MultiValue } from "react-select"
import { 
	useAddProjectMutation, 
	useGetProjectQuery,
	useGetProjectBoardsQuery, 
	useUpdateProjectBoardsMutation, 
	useDeleteProjectBoardsMutation,
	useUpdateProjectMutation 
} from "../../services/private/project"
import { v4 as uuidv4 } from "uuid"
import { addToast } from "../../slices/toastSlice"
import { LoadingButton } from "../page-elements/LoadingButton"
import { Board, Project, OptionType, UserProfile } from "../../types/common"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { ProfileCard } from "../page-elements/ProfileCard"
import { PROJECT_URL, BOARD_URL } from "../../helpers/urls"
import { AsyncSelect } from "../AsyncSelect"
import { AsyncMultiSelect } from "../AsyncMultiSelect"
import { useForm, Controller } from "react-hook-form"
import { USER_PROFILE_URL } from "../../helpers/urls"
import { displayUser } from "../../helpers/functions"
import { useGetUserQuery } from "../../services/private/userProfile"
import { LoadingSpinner } from "../LoadingSpinner"

type FormValues = {
	id?: number
	name: string
	description?: string
	imageUrl?: string
	userIdOption: OptionType,
	boardIdOptions: Array<OptionType>
}

interface ProjectFormProps {
    projectId?: number
}

export const ProjectForm = ({ projectId }: ProjectFormProps) => {
	const dispatch = useAppDispatch()
	const [cacheKey, setCacheKey] = useState(uuidv4())
	const selectRef = useRef<SelectInstance<OptionType, false, GroupBase<OptionType>>>(null) 
	const { showModal } = useAppSelector((state) => state.modal)
	const defaultForm: FormValues = {
		id: undefined,
		name: "",
		imageUrl: "",
		description: "",
		userIdOption: {label: "", value: ""},
		boardIdOptions: []
	}
	const [ addProject ] = useAddProjectMutation()
	const [ updateProject ] = useUpdateProjectMutation()
	const { data: projectInfo, isLoading: isGetProjectDataLoading } = useGetProjectQuery(projectId ? {id: projectId, urlParams: {}} : skipToken)
	const { data: projectBoards, isLoading: isProjectBoardsLoading } = useGetProjectBoardsQuery(projectId ? {id: projectId, urlParams: {}} : skipToken)
	const [ updateProjectBoards, { isLoading: isUpdateProjectBoardsLoading }] = useUpdateProjectBoardsMutation()
	const [ deleteProjectBoards, { isLoading: isDeleteProjectBoardsLoading }] = useDeleteProjectBoardsMutation()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const [ preloadedValues, setPreloadedValues ] = useState<FormValues>(defaultForm)
	const { register, handleSubmit, reset, setValue, watch, getValues, control, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})
	const [ submitLoading, setSubmitLoading ] = useState(false)
	const [ attachedBoardIds, setAttachedBoardIds ] = useState<Array<number>>([])
	const registerOptions = {
	    name: { required: "Name is required" },
	    userIdOption: { required: "Owner is required" },
		boardIdOptions: { /* boards are optional */}
	}

	useEffect(() => {
		// initialize with current values if the project exists
		if (projectBoards && projectInfo){
			const options: Array<OptionType> = projectBoards.data.map((board: Board) => {
				const option: OptionType = {
					label: board.name,
					value: board.id.toString()
				}
				return option
			})
			reset({id: projectId, 
				boardIdOptions: options,
				userIdOption: {
				label: displayUser(projectInfo.owner),
				value: projectInfo.owner.id.toString(),
			}, name: projectInfo.name, description: projectInfo.description})
		}
		else {
			reset(defaultForm)
		}
	}, [showModal, projectInfo, projectBoards, projectId])

    const onSubmit = async (values: FormValues) => {
		setSubmitLoading(true)
    	try {
			let newProjectId = 0
    		if (values.id != null && projectId){
				await updateProject({
					id: projectId,
					name: values.name,
					description: values.description,
					userId: !isNaN(parseInt(values.userIdOption.value)) ? parseInt(values.userIdOption.value) : 0
				}).unwrap()
    		}
    		else {
    			const res = await addProject({
					name: values.name,
					description: values.description,
					imageUrl: values.imageUrl,
					userId: !isNaN(parseInt(values.userIdOption.value)) ? parseInt(values.userIdOption.value) : 0
				}).unwrap()
				newProjectId = res.id
    		}
			if (projectId || newProjectId){
				await updateProjectBoards({
					id: projectId ?? newProjectId,
					boardIds: values.boardIdOptions.map((option) => {
						return parseInt(option.value)
					})
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
		<div className = "tw-flex tw-flex-col tw-gap-y-2 lg:tw-w-[80%] tw-w-full">
			{
				projectId ? 
				<ProfileCard isOrg={true} showUploadImage={true} entityId={projectId ?? 0} imageUrl={projectInfo?.imageUrl ?? ""} imageUploadUrl={`${PROJECT_URL}/image`} invalidatesTags={["Projects"]} />
				: null
			}
			<form onSubmit={handleSubmit(onSubmit)} className = "tw-w-full tw-flex tw-flex-col tw-gap-y-2">
				{
					!projectId ? 
					<div className = "tw-flex tw-flex-col">
						<label htmlFor="project-image-url" className = "label">Image URL</label>
						<input id={"project-image-url"} {...register("imageUrl")} type = "text"/>
					</div>
					: null
				}
				<div className = "tw-flex tw-flex-col">
					<label className = "label" htmlFor={"project-owner"}>
						Owner <span className = "tw-font-bold tw-text-red-500">*</span>
					</label>
					<Controller
						name={"userIdOption"}
						control={control}
						rules={registerOptions.userIdOption}
						render={({ field: { onChange, value, name, ref } }) => (
							<AsyncSelect 
								id={"project-owner"}
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
				</div>
				
				<div className = "tw-flex tw-flex-col">
					<label className = "label" htmlFor = "project-name">
						Name <span className = "tw-font-bold tw-text-red-500">*</span>
					</label>
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
					<label className = "label" htmlFor={"project-boards"}>Boards</label>
					<Controller
						name={"boardIdOptions"}
						control={control}
						rules={registerOptions.boardIdOptions}
						render={({ field: { onChange, value, name, ref } }) => (
							<AsyncMultiSelect 
								id={"project-boards"}
								endpoint={BOARD_URL} 
								clearable={true}
								defaultValue={watch("boardIdOptions") ?? null}
								urlParams={{forSelect: true}} 
								onSelect={async (selectedOption: MultiValue<OptionType> | null) => {
									onChange(selectedOption)
								}}
							/>
						)}
					/>
				</div>
				<div>
					<LoadingButton isLoading={submitLoading} type="submit" text="Submit" className = "button"/>
				</div>
			</form>
		</div>
	)
}
