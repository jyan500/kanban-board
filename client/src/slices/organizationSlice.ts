import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { Organization } from "../types/common"

type OrganizationState = {
  organizations: Array<Organization>
}

const initialState: OrganizationState = {
	organizations: [],
}

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setOrganization: (
      state,
      {
        payload: { organizations },
      }: PayloadAction<{ organizations: Array<Organization> }>,
    ) => {
    	state.organizations = organizations
    },
  },
})

export const { setOrganization } = organizationSlice.actions

export const organizationReducer = organizationSlice.reducer
