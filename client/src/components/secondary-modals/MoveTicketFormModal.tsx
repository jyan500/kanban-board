import React, {useState} from "react"
import { AsyncSelect } from "../AsyncSelect"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useForm, Controller } from "react-hook-form"
import { BOARD_URL } from "../../helpers/urls" 
import { addToast } from "../../slices/toastSlice"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../../slices/secondaryModalSlice"
import { toggleShowModal, setModalProps } from "../../slices/modalSlice"
import { Toast } from "../../types/common"
import { v4 as uuidv4 } from "uuid"
import { useAddBoardTicketsMutation, useDeleteBoardTicketMutation } from "../../services/private/board"
import { MoveTicketForm } from "../forms/MoveTicketForm"

type Props = {
	ticketId: number | string | undefined
	boardId: number | string | null | undefined
}

export const MoveTicketFormModal = ({boardId: currentBoardId, ticketId}: Props) => {
	return (
		<MoveTicketForm ticketId={ticketId} boardId={currentBoardId} title={"Move Issue"}/>
	)
}
