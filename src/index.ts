import joplin from 'api';
import { MenuItemLocation } from 'api/types';
import { DiffWindow } from './DiffWindow';

let diffWindow;

async function openDiffWindow(noteIds : string[]) {
	if(noteIds.length !== 1) {
		// Comparing multiple notes not yet supported.
		return;
	}
	const noteId = noteIds[0];

	//try {
		await diffWindow.OpenWindow(noteId);
	//} catch(ex) {
	//	joplin.views.dialogs.showMessageBox(ex.message);
	//}
}

joplin.plugins.register({
	onStart: async function() {

		diffWindow = new DiffWindow(joplin.views.dialogs, joplin.data, joplin.require('fs-extra'), await joplin.plugins.installationDir());

		await diffWindow.Init("conflictResolution-dialog");

		await joplin.commands.register({
			name: 'resolveConflictsCommand',
			label: 'Resolve Conflict',
			enabledCondition: "oneNoteSelected && inConflictFolder",
			execute: openDiffWindow,
		});

		joplin.views.menuItems.create('resolveConflictsButton', 'resolveConflictsCommand', MenuItemLocation.NoteListContextMenu);

		console.info('Conflict Resolution Plugin loaded!');
	},
});
