import { useEffect } from "react"
import { trackViewedItem } from "../helpers/recentlyViewed"
import { useAppSelector } from "./redux-hooks"

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
    const { userProfile } = useAppSelector((state) => state.userProfile)
    useEffect(() => {
        if (enabled && id && name && userProfile) {
            trackViewedItem(type, id, name, userProfile.organizationId, userProfile.id)
        }
    }, [type, id, name, enabled, userProfile])
}
