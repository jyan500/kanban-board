import { createStore } from "redux"
import { configureStore } from "@reduxjs/toolkit" 
import { boardReducer } from "./slices/boardSlice" 
import { navReducer }  from "./slices/navSlice"
import { authReducer } from "./slices/authSlice" 
import { organizationReducer } from "./slices/organizationSlice" 
import { authApi } from "./services/auth" 
import { organizationApi } from "./services/organization" 
import { userRegisterApi } from "./services/register" 
import { userProfileReducer }  from "./slices/userProfileSlice"
import { userProfileApi } from "./services/userProfile" 
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
		[authApi.reducerPath]: authApi.reducer,
		[organizationApi.reducerPath]: organizationApi.reducer,
		[userProfileApi.reducerPath]: userProfileApi.reducer,
		[userRegisterApi.reducerPath]: userRegisterApi.reducer,
		"board": boardReducer,
		"auth": authReducer,
		"nav": navReducer,
		"org": organizationReducer,
		"userProfile": userProfileReducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: {
			ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
		},
	}).concat(logger)
	.concat(authApi.middleware)
	.concat(organizationApi.middleware)
	.concat(userProfileApi.middleware)
	.concat(userRegisterApi.middleware)
})

// Infer the 'RootState' and 'AppDispatch' types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// export const persistor = persistStore(store)



