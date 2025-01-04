import { EditorState, Modifier, SelectionState, ContentBlock } from 'draft-js'
import {extractLinks} from "@draft-js-plugins/linkify"
/* 
https://github.com/draft-js-plugins/draft-js-plugins/issues/302
Purpose is to create link entities using the linkify plugin, so once saved,
the a link will be created when displaying the text editor content.
Code Credit: https://gist.github.com/anders0l/7a2c2b9a59b1c66a85089c597984d916
Made some small changes included some TSX undefined errors, changing to use "extractLinks" instead of linkify,
and adding the url when creating the entity so it works with the entityStyleFn when converting from EditorState to HTML
*/
const findLinks = (
    contentBlock: ContentBlock,
    callback: (firstIndex: number, lastIndex: number, href: string) => void
) => {
    const contentBlockText = contentBlock.get('text')
    const links = extractLinks(contentBlockText) 
    if (typeof links !== 'undefined' && links !== null) {
        for (const link of links) {
            callback(link.index, link.lastIndex, link.url)
        }
    }
}

const linkifyEditorState = (editorState: EditorState): EditorState => {
    const contentState = editorState.getCurrentContent()
    const blocks = contentState.getBlockMap()
    let newContentState = contentState
    blocks.forEach(block => {
        if (block){
            const plainText = block.getText()

            const addEntityToLink = (start: number, end: number, href: string) => {
                const existingEntityKey = block.getEntityAt(start)
                if (existingEntityKey) {
                    // avoid manipulation in case the link already has an entity
                    const entity = contentState.getEntity(existingEntityKey)
                    if (entity && entity.getType() === 'LINK' && entity.getData().href === href) {
                        return
                    }
                }

                const selection = editorState
                .getSelection()
                .set('anchorOffset', start)
                .set('focusOffset', end)

                const linkText = plainText.substring(start, end)
                // slight edit, added url as the href so that this will work with the entityStyleFn when converting the editor state to HTML
                const contentStateWithEntity = contentState.createEntity('LINK', 'IMMUTABLE', { text: linkText, href: href, url: href })
                const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
                if (selection instanceof SelectionState) {
                    newContentState = Modifier.replaceText(newContentState, selection, linkText, undefined, entityKey)
                }
            }
            findLinks(block, addEntityToLink)
        }
    })

    if (!newContentState.equals(contentState)) {
        return EditorState.push(editorState, newContentState, 'apply-entity')
    }

    return editorState
}

export default linkifyEditorState
