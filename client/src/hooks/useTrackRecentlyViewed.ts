import { useEffect } from "react"
import { trackViewedItem } from "../helpers/recentlyViewed"

interface UseTrackRecentlyViewedProps {
    type: string
    id: number | undefined
    name: string | undefined
    enabled?: boolean
}

export const useTrackRecentlyViewed = ({
    type,
    id,
    name,
    enabled=true
}: UseTrackRecentlyViewedProps) => {
    useEffect(() => {
        if (enabled && id && name) {
            trackViewedItem(type, id, name)
        }
    }, [type, id, name, enabled])
}
