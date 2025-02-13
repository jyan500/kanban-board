import React, {useState, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useForm } from "react-hook-form"
import { useGetBoardStatusQuery, useUpdateBoardStatusMutation } from "../../services/private/board"
import { v4 as uuidv4 } from "uuid"
import { addToast } from "../../slices/toastSlice"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../../slices/secondaryModalSlice"
import { Toast } from "../../types/common"
import { BackendErrorMessage } from "../page-elements/BackendErrorMessage"

export type SetColumnLimitModalProps = {
	boardId: number
	statusId: number
}

type FormValues = {
 	limit: number
}

export const SetColumnLimitModal = ({boardId, statusId}: SetColumnLimitModalProps) => {
	const dispatch = useAppDispatch()
	const { data: boardStatus, isLoading, isError } = useGetBoardStatusQuery({boardId, statusId})
	const [ updateBoardStatus, {isLoading: isUpdateBoardStatusLoading, error} ] = useUpdateBoardStatusMutation()
	const { showSecondaryModal } = useAppSelector((state) => state.secondaryModal)
	const defaultForm: FormValues = {
		limit: 1
	}
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register , handleSubmit, reset , setValue, getValues, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})	
	const registerOptions = {
	    limit: { 
	    	required: "Limit is required", 
		    valueAsNumber: true,
	        min: { value: 1, message: "Must be at least 1" },
	        max: { value: 50, message: "Must be at most 50" }
	    }
    }

    useEffect(() => {
    	if (boardStatus){
    		reset({limit: boardStatus.limit})
    	}	
    }, [showSecondaryModal, boardStatus])

    const onSubmit = async (values: FormValues) => {
    	const toast: Toast = {
    		id: uuidv4(),		
    		message: "Limit set successfully!",
    		animationType: "animation-in",
    		type: "success",
    	}
    	try {
    		await updateBoardStatus({limit: values.limit, statusId, boardId}).unwrap()
    		dispatch(addToast(toast))
			dispatch(toggleShowSecondaryModal(false))
	    	dispatch(setSecondaryModalType(undefined))
	    	dispatch(setSecondaryModalProps({}))
    	}
    	catch {
    		dispatch(addToast({
    			...toast,	
    			type: "failure",
    			message: "Something went wrong when setting limit"
    		}))
    	}
    }

    const onClose = () => {
    	dispatch(toggleShowSecondaryModal(false))
    	dispatch(setSecondaryModalType(undefined))
    	dispatch(setSecondaryModalProps({}))
    }

	return (
		<form onSubmit={handleSubmit(onSubmit)} className = "tw-flex tw-flex-col tw-gap-y-2">
			<div>
				<h2>Set Column Limit</h2>	
				<p>We'll highlight this column if the number of issues in it passes this limit.</p>
				<p>Must be between 1 and 50.</p>
				<BackendErrorMessage error={error}/>
			</div>
			<div>
				<label className = "label">Maximum Tickets</label>
				<input type = "number" {...register("limit", registerOptions.limit)} />	
		        {errors?.limit && <small className = "--text-alert">{errors.limit.message}</small>}
			</div>
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				<button type = "submit" className = "button">Save</button>
				<button onClick = {(e) => {
					e.preventDefault()
					onClose()
				}} className = "button --secondary">Cancel</button>
			</div>
		</form>
	)
}
