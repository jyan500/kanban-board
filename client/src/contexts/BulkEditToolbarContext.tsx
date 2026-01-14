import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"

export interface BulkEditToolbarConfig {
	itemIds: Array<number>
	updateIds: (ids: Array<number>) => void
	applyActionToAll?: (ids: Array<number>) => void
	applyRemoveToAll?: (ids: Array<number>) => void
	actionText?: string
	removeText?: string
	children?: ReactNode
}

interface BulkEditToolbarContextType {
	toolbarConfig: BulkEditToolbarConfig | null
	registerToolbar: (config: BulkEditToolbarConfig) => void
	unregisterToolbar: () => void
}

const BulkEditToolbarContext = createContext<BulkEditToolbarContextType | undefined>(undefined)

export const BulkEditToolbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [toolbarConfig, setToolbarConfig] = useState<BulkEditToolbarConfig | null>(null)

	const registerToolbar = useCallback((config: BulkEditToolbarConfig) => {
		setToolbarConfig(config)
	}, [])

	const unregisterToolbar = useCallback(() => {
		setToolbarConfig(null)
	}, [])

	return (
		<BulkEditToolbarContext.Provider value={{ toolbarConfig, registerToolbar, unregisterToolbar }}>
			{children}
		</BulkEditToolbarContext.Provider>
	)
}

export const useBulkEditToolbar = () => {
	const context = useContext(BulkEditToolbarContext)
	if (context === undefined) {
		throw new Error("useBulkEditToolbar must be used within a BulkEditToolbarProvider")
	}
	return context
}
