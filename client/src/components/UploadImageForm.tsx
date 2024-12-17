import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useGenericImageUploadMutation } from "../services/private/generic"
import { CgProfile } from "react-icons/cg"
import { addToast } from "../slices/toastSlice"
import { useAppDispatch } from "../hooks/redux-hooks"
import { Toast } from "../types/common"
import { v4 as uuidv4 } from "uuid"
import { Avatar } from "./page-elements/Avatar"

interface Props {
	id: number
	endpoint: string
	invalidatesTags: Array<string>
	imageUrl?: string
}

type FormValues = {
	imageUrl: string	
}

export const UploadImageForm = ({id, imageUrl, endpoint, invalidatesTags}: Props) => {
	const defaultForm = {
		imageUrl: imageUrl ?? "" 
	}
	const dispatch = useAppDispatch()
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register, handleSubmit, reset, watch, formState: {errors} } = useForm<FormValues>({defaultValues: preloadedValues})
	const [ genericImageUpload, {isLoading, error} ] = useGenericImageUploadMutation()

	const onSubmit = async (values: FormValues) => {
		try {
			await genericImageUpload({id, endpoint, imageUrl: values.imageUrl, invalidatesTags}).unwrap()
			dispatch(addToast({
				id: uuidv4(),	
				message: "Image uploaded successfully!"	,
				animationType: "animation-in",
				type: "success"
			}))

		}
		catch (e){
			dispatch(addToast({
				id: uuidv4(),
				message: "Image failed to upload.",
				animationType: "animation-in",
				type: "failure"
			}))
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className = "tw-flex tw-flex-col tw-gap-y-2">
			{/*<Avatar imageUrl={imageUrl} size={"l"}/>*/}
			<div>
				<label className = "label">Image Url: </label>
				<input {...register("imageUrl")} placeholder={"URL"} type="text" className = "tw-w-full"/>
			</div>
			<div>
				<button type = "submit" className = "button">Upload</button>
			</div>
			{error && "status" in error ? (error.data.errors?.map((errorMessage: string, i: number) => <p className = "--text-alert" key = {`image_error_${i}`}>{errorMessage}</p>)) : null}
		</form>
	)
}
