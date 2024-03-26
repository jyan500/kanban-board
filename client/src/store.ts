import { createStore } from "redux"
import { configureStore } from "@reduxjs/toolkit" 
import { boardReducer } from "./slices/boardSlice" 
import { navReducer }  from "./slices/navSlice"
import { authReducer } from "./slices/authSlice" 
import { api } from "./services/auth" 
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
		[api.reducerPath]: api.reducer,
		"board": boardReducer,
		"auth": authReducer,
		"nav": navReducer
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: {
			ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
		},
	}).concat(logger).concat(api.middleware)
})

// Infer the 'RootState' and 'AppDispatch' types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// export const persistor = persistStore(store)



