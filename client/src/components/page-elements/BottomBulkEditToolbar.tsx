import React from "react"
import { TOOLBAR_Z_INDEX } from "../../helpers/constants"
import { useBulkEditToolbar } from "../../contexts/BulkEditToolbarContext"
import { BulkEditToolbar } from "./BulkEditToolbar"

export const BottomBulkEditToolbar = () => {
    const { toolbarConfig } = useBulkEditToolbar()
    
    // Only show if there's a config and it has selected items
    const shouldShow = toolbarConfig && toolbarConfig.itemIds.length > 0

    return (
        <div className = {`${TOOLBAR_Z_INDEX} tw-p-4 tw-rounded-md tw-shadow-lg tw-bg-white tw-fixed tw-left-1/2 -tw-translate-x-1/2 tw-w-[800px] tw-max-w-[90vw] tw-transition-transform tw-duration-350 tw-ease-out ${
            shouldShow ? 'tw-bottom-4 tw-translate-y-0' : 'tw-translate-y-full tw-bottom-0'
        }`}>
            {toolbarConfig && toolbarConfig.itemIds.length > 0 ? (
                <BulkEditToolbar
                    itemIds={toolbarConfig.itemIds}
                    updateIds={toolbarConfig.updateIds}
                    applyActionToAll={toolbarConfig.applyActionToAll}
                    applyRemoveToAll={toolbarConfig.applyRemoveToAll}
                    actionText={toolbarConfig.actionText}
                    removeText={toolbarConfig.removeText}
                    children={toolbarConfig.children}
                />
            ) : null}
        </div>
    )
}