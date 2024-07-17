import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { Board } from "../types/common"
import { logout } from "./authSlice"

type BoardInfoState = {
    boardInfo: Array<Board>
    currentBoardId: number | null
}

const initialState: BoardInfoState = {
    boardInfo: [],
    currentBoardId: null 
}

const boardInfoSlice = createSlice({
    name: 'boardInfo',
    initialState,
    reducers: {
      	setBoardInfo: (state, { payload: { boardInfo }}: PayloadAction<{ boardInfo: Array<Board> }>,
        ) => {
            state.boardInfo = boardInfo
        },
        setCurrentBoardId: (state, action: PayloadAction<number | null>) => {
            state.currentBoardId = action.payload 
        }
    },
    extraReducers: (builder) => {
        builder.addCase(logout, () => {
            return initialState
        })
    }
})

export const { setCurrentBoardId, setBoardInfo } = boardInfoSlice.actions

export const boardInfoReducer = boardInfoSlice.reducer
