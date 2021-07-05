import joplin from 'api';
import {MenuItemLocation} from 'api/types';
import {DiffWindow} from './DiffWindow';
import {NoteSelectWindow} from './NoteSelectWindow';

let diffWindow : DiffWindow;
let noteSelectWindow : NoteSelectWindow;

/**
 * Opens a Diff Window to resolve a conflict.
 * @param {string[]} noteIds Should contain the note to resolve the conflict for.
 */
async function openDiffWindow(noteIds : string[]) {
    if (noteIds.length !== 1) {
    // Comparing multiple notes not yet supported.
        return;
    }

    const noteId = noteIds[0];
    const localNote = await joplin.data.get(['notes', noteId], {
        fields: ['is_conflict', 'conflict_original_id'],
    });

    if (localNote.is_conflict === 0) {
        return await joplin.views.dialogs.showMessageBox('This is not a conflict note.');
    }

    let compareWithId = localNote.conflict_original_id;
    if (compareWithId === '') {
        compareWithId = await noteSelectWindow.openDialog();
    }

    if (compareWithId === '') {
    // No note was found to compare to and user didn't select a note. Cancel button must have been pressed.
        return;
    }

    try {
        const resp = await diffWindow.openWindow(noteId, compareWithId);
        if (resp === null) {
            // If it's null, the Cancel button was pressed.
            return;
        }

        // The note in the normal folder is actually the note that came from the remote server, AKA the one in compareWithId.
        // So, we must replace the contents of that note. The note at `noteId` exists in conflicts folder and will be removed.
        await joplin.data.put(['notes', compareWithId], null, {
            body: resp.NoteContents,
            title: resp.NoteTitle,
        });

        await joplin.data.delete(['notes', noteId]);

        await joplin.views.dialogs.showMessageBox('Successfully resolved conflict!');
    } catch (ex) {
        joplin.views.dialogs.showMessageBox(ex.message);
    }
}

joplin.plugins.register({
    onStart: async function() {
        diffWindow = new DiffWindow(joplin.views.dialogs, joplin.data, joplin.require('fs-extra'), await joplin.plugins.installationDir());
        await diffWindow.init('conflictResolution-diff-dialog');

        noteSelectWindow = new NoteSelectWindow(joplin.views.dialogs, joplin.data, joplin.require('fs-extra'), await joplin.plugins.installationDir());
        await noteSelectWindow.init('conflictResolution-noteSelect-dialog');

        await joplin.commands.register({
            name: 'resolveConflictsCommand',
            label: 'Resolve Conflict',
            enabledCondition: 'oneNoteSelected && inConflictFolder',
            execute: openDiffWindow,
        });

        joplin.views.menuItems.create('resolveConflictsButton', 'resolveConflictsCommand', MenuItemLocation.NoteListContextMenu);

        console.info('Conflict Resolution Plugin loaded!');
    },
});
