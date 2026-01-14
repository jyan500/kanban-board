import React, { useEffect, useState } from "react"
import { TOOLBAR_Z_INDEX } from "../../helpers/constants"
import { useBulkEditToolbar } from "../../contexts/BulkEditToolbarContext"
import { BulkEditToolbar } from "./BulkEditToolbar"
import type { BulkEditToolbarConfig } from "../../contexts/BulkEditToolbarContext"

export const BottomBulkEditToolbar = () => {
    const { toolbarConfig } = useBulkEditToolbar()
    
    // Only show if there's a config and it has selected items
    const shouldShow = toolbarConfig && toolbarConfig.itemIds.length > 0
    
    // Store config in state to persist during close animation
    const [displayConfig, setDisplayConfig] = useState<BulkEditToolbarConfig | null>(null)

    useEffect(() => {
        if (shouldShow && toolbarConfig) {
            // Update config immediately when opening
            setDisplayConfig(toolbarConfig)
        } else if (!shouldShow) {
            // Delay clearing config until animation completes (350ms)
            const timer = setTimeout(() => {
                setDisplayConfig(null)
            }, 350)
            return () => clearTimeout(timer)
        }
    }, [shouldShow, toolbarConfig])

    return (
        <div className = {`${TOOLBAR_Z_INDEX} tw-p-4 tw-rounded-md tw-shadow-lg tw-bg-white tw-fixed tw-left-1/2 -tw-translate-x-1/2 tw-w-[800px] tw-max-w-[90vw] tw-transition-transform tw-duration-350 tw-ease-out ${
            shouldShow ? 'tw-bottom-4 tw-translate-y-0' : 'tw-translate-y-full tw-bottom-0'
        }`}>
            {displayConfig && displayConfig.itemIds.length > 0 ? (
                <BulkEditToolbar
                    itemIds={displayConfig.itemIds}
                    updateIds={displayConfig.updateIds}
                    applyActionToAll={displayConfig.applyActionToAll}
                    applyRemoveToAll={displayConfig.applyRemoveToAll}
                    actionText={displayConfig.actionText}
                    removeText={displayConfig.removeText}
                    children={displayConfig.children}
                />
            ) : null}
        </div>
    )
}