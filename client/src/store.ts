import { createStore } from "redux"
import { configureStore } from "@reduxjs/toolkit" 
import { boardReducer } from "./slices/boardSlice" 
import { boardInfoReducer } from "./slices/boardInfoSlice" 
import { boardScheduleReducer } from "./slices/boardScheduleSlice"
import { ticketReducer } from "./slices/ticketSlice" 
import { navReducer }  from "./slices/navSlice"
import { authReducer } from "./slices/authSlice" 
import { toastReducer } from "./slices/toastSlice" 
import { organizationReducer } from "./slices/organizationSlice" 
import { userProfileReducer }  from "./slices/userProfileSlice"
import { ticketTypeReducer } from "./slices/ticketTypeSlice" 
import { ticketRelationshipTypeReducer } from "./slices/ticketRelationshipTypeSlice"
import { priorityReducer } from "./slices/prioritySlice" 
import { notificationTypeReducer } from "./slices/notificationTypeSlice"
import { statusReducer } from "./slices/statusSlice" 
import { modalReducer } from "./slices/modalSlice" 
import { tooltipReducer } from "./slices/tooltipSlice"
import { toolbarReducer } from "./slices/toolbarSlice"
import { secondaryModalReducer } from "./slices/secondaryModalSlice" 
import { userRoleReducer } from "./slices/userRoleSlice" 
import { publicApi } from "./services/public"
import { privateApi } from "./services/private"
import {
	persistStore,
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from "redux-persist"
import storage from "redux-persist/lib/storage"
import logger from 'redux-logger'

const persistConfig = {
	key: "root",
	version: 1,
	storage,
}

export const store = configureStore({
	reducer: {
		[publicApi.reducerPath]: publicApi.reducer,
		[privateApi.reducerPath]: privateApi.reducer,
		"board": boardReducer,
		"boardInfo": boardInfoReducer,
		"boardSchedule": boardScheduleReducer,
		"auth": authReducer,
		"nav": navReducer,
		"org": organizationReducer,
		"userProfile": userProfileReducer,
		"status": statusReducer,
		"ticketType": ticketTypeReducer,
		"ticket": ticketReducer,
		"priority": priorityReducer,
		"toast": toastReducer,
		"modal": modalReducer,
		"userRole": userRoleReducer,
		"ticketRelationshipType": ticketRelationshipTypeReducer,
		"secondaryModal": secondaryModalReducer,
		"notificationType": notificationTypeReducer,
		"tooltip": tooltipReducer,
		"toolbar": toolbarReducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: {
			ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
		},
	}).concat(logger)
	.concat(publicApi.middleware)
	.concat(privateApi.middleware)
})


// Infer the 'RootState' and 'AppDispatch' types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// export const persistor = persistStore(store)



