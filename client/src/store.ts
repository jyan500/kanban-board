import { createStore } from "redux"
import { configureStore } from "@reduxjs/toolkit" 
import { boardReducer } from "./slices/boardSlice" 
import { ticketReducer } from "./slices/ticketSlice" 
import { navReducer }  from "./slices/navSlice"
import { authReducer } from "./slices/authSlice" 
import { organizationReducer } from "./slices/organizationSlice" 
import { userProfileReducer }  from "./slices/userProfileSlice"
import { ticketTypeReducer } from "./slices/ticketTypeSlice" 
import { priorityReducer } from "./slices/prioritySlice" 
import { statusReducer } from "./slices/statusSlice" 
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
		"auth": authReducer,
		"nav": navReducer,
		"org": organizationReducer,
		"userProfile": userProfileReducer,
		"status": statusReducer,
		"ticketType": ticketTypeReducer,
		"ticket": ticketReducer,
		"priority": priorityReducer,
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



