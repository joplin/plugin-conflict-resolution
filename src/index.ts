import joplin from 'api';
import { MenuItemLocation } from 'api/types';
const dialogs = joplin.views.dialogs;


let diffViewDialog;

async function openDiffWindow(noteIds : string[]) {
	if(noteIds.length !== 1) {
		// Comparing multiple notes not yet supported.
		return;
	}
	const noteId = noteIds[0];
	const localNote = await joplin.data.get(['notes', noteId], {
		fields: ['is_conflict', 'conflict_original_id', 'body']
	});

	if(localNote.is_conflict === 0) {
		return await dialogs.showMessageBox('This is not a conflict note.');
	}

	if(localNote.conflict_original_id.length === 0) {
		// TODO: add window to select the note to compare to. This is for "legacy" conflict notes that don't have the field populated.
		return;
	}

	const remoteNote = await joplin.data.get(['notes', localNote.conflict_original_id], {
		fields: ['body']
	});

	const remoteNoteContent = remoteNote.body.replace(/"/g, '&quot;');
	const localNoteContent = localNote.body.replace(/"/g, '&quot;');

	// These inputs are a simple hack in order to pass data into the WebView.
	await dialogs.setHtml(diffViewDialog, `
		<input id="pluginInstallDir" type="hidden" value="${await joplin.plugins.installationDir()}"/> 
		<input id="origNote" type="hidden" value="${remoteNoteContent}"/> 
		<input id="curNote" type="hidden" value="${localNoteContent}"/> 
		<div id="conflictRes-Editor"></div>
	`);

	let response = await dialogs.open(diffViewDialog);
	console.dir(response);
}

joplin.plugins.register({
	onStart: async function() {

		diffViewDialog = await dialogs.create("conflictRes-mainDialog");
		await dialogs.addScript(diffViewDialog, './UI/codemirror/lib/codemirror.js');
		await dialogs.addScript(diffViewDialog, './UI/codemirror/lib/codemirror.css');
		//await dialogs.addScript(diffViewDialog, './UI/codemirror/mode/markdown/markdown.js');
		await dialogs.addScript(diffViewDialog, './UI/diff_match_patch/diff_match_patch.js');
		//await dialogs.addScript(diffViewDialog, './UI/codemirror/addon/merge/merge.js');
		await dialogs.addScript(diffViewDialog, './UI/index.js');
		await dialogs.addScript(diffViewDialog, './UI/codemirror/addon/merge/merge.css');
		await dialogs.addScript(diffViewDialog, './UI/index.css');

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
