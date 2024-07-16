import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { Board } from "../types/common"
import { logout } from "./authSlice"

type BoardInfoState = {
    boardInfo: Array<Board>
}

const initialState: BoardInfoState = {
    boardInfo: []
}

const boardInfoSlice = createSlice({
    name: 'boardInfo',
    initialState,
    reducers: {
      	setBoardInfo: (state, { payload: { boardInfo }}: PayloadAction<{ boardInfo: Array<Board> }>,
        ) => {
            state.boardInfo = boardInfo
        },
    },
    extraReducers: (builder) => {
        builder.addCase(logout, () => {
            return initialState
        })
    }
})

export const { setBoardInfo } = boardInfoSlice.actions

export const boardInfoReducer = boardInfoSlice.reducer
