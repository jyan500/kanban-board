import { useEffect } from "react"
import type { AppDispatch } from "../store"

export interface UseFilterSyncParams<T extends Record<string, any>> {
	filters: T
	defaultFilters: T
	setFiltersAction: (filters: T) => { type: string; payload: T }
	searchParams: URLSearchParams
	setSearchParams: (params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams), options?: { replace?: boolean }) => void
	parseFilterValue: (key: string, value: string) => any
	fromDashboard?: boolean
	dispatch: AppDispatch
}

/**
 * Custom hook to sync filter state with URL search parameters.
 * 
 * Contains two effects:
 * 1. Syncs filters to URL when filters change (wrapped in fromDashboard check if provided)
 * 2. Initializes filters from URL on mount (wrapped in fromDashboard check if provided)
 */
export function useFilterSync<T extends Record<string, any>>({
	filters,
	defaultFilters,
	setFiltersAction,
	searchParams,
	setSearchParams,
	parseFilterValue,
	fromDashboard,
	dispatch
}: UseFilterSyncParams<T>): void {
	/* when filters are changed, add to search params */
	useEffect(() => {
		if (!fromDashboard) {
			const newSearchParams = new URLSearchParams(searchParams)
		
			// Update or remove filter params based on their values
			Object.entries(filters).forEach(([key, value]) => {
				if (value === null) {
					newSearchParams.delete(key)
				} else {
					newSearchParams.set(key, String(value))
				}
			})
			
			// Reset to page 1 when filters change
			newSearchParams.set("page", "1")
			
			setSearchParams(newSearchParams, { replace: true })
		}
        
	}, [filters, fromDashboard])

	// on mount, reset all filters and pre-populate the filters based on URL search params 
	useEffect(() => {
		if (!fromDashboard) {
			// First, reset all filters
			const resettedFilters = { ...defaultFilters }
			
			// Apply any filters from the incoming search params
			const filterKeys = Object.keys(resettedFilters)
			filterKeys.forEach((key) => {
				const value = searchParams.get(key)
				if (value) {
					const parsedValue = parseFilterValue(key, value)
					resettedFilters[key as keyof T] = value === "" ? null : parsedValue
				}
			})
			
			// Update Redux with the new filters
			dispatch(setFiltersAction(resettedFilters))
			
			// Clean up the URL to only include the new filters plus search/page params
			const newSearchParams = new URLSearchParams()

			// Keep non-filter params (searchBy, query, page)
			if (searchParams.get("searchBy")) newSearchParams.set("searchBy", searchParams.get("searchBy") ?? "")
			if (searchParams.get("query")) newSearchParams.set("query", searchParams.get("query") ?? "")
			if (searchParams.get("page")) newSearchParams.set("page", searchParams.get("page") ?? "")
			
			// Add the new filter params
			Object.entries(resettedFilters).forEach(([key, value]) => {
				if (value !== null) {
					newSearchParams.set(key, String(value))
				}
			})
			
			setSearchParams(newSearchParams, { replace: true })
		}

	}, [fromDashboard])
}
