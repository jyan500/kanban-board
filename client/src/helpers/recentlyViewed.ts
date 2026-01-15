import { ViewedItem } from "../types/common"

const STORAGE_KEY = "recentlyViewed"
const MAX_ITEMS = 20

// Add item to recently viewed
export const trackViewedItem = (type: string, id: number, name: string) => {
    // Get existing items from localStorage
    const existingItems: Array<ViewedItem> = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")

    // remove item if it already exists
    const filteredItems = existingItems.filter((item) => {
        return !(item.type === type && item.id === id)
    })

    // Add new item to the beginning of the array
    filteredItems.unshift({
        type,
        id,
        name,
        viewedAt: new Date()
    })

    // keep only up to MAX_ITEMS
    const trimmedItems = filteredItems.slice(0, MAX_ITEMS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedItems))

    // Emit custom event so dashboard component can update immediately
    window.dispatchEvent(new Event('recentlyViewedUpdated'));
}

// Get recently viewed items
export const getRecentlyViewed = (limit: number=10): Array<ViewedItem> => {
    const items: Array<ViewedItem> = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    )    
    return items.slice(0, limit)
}

// Clear all recently viewed items
export const clearRecentlyViewed = () => {
    localStorage.removeItem(STORAGE_KEY)
}
