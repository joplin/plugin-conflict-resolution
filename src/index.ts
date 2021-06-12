import joplin from 'api';

joplin.plugins.register({
	onStart: async function() {
		const dialogs = joplin.views.dialogs;
		
		// DEBUG
		const handle = await dialogs.create("conflictRes-mainDialog");
		await dialogs.addScript(handle, './UI/codemirror/lib/codemirror.js');
		await dialogs.addScript(handle, './UI/codemirror/lib/codemirror.css');
		await dialogs.setHtml(handle, `<div id="conflictRes-Editor"></div>`);
		await dialogs.addScript(handle, './UI/index.css');
		await dialogs.addScript(handle, './UI/codemirror/addon/merge/merge.css');
		await dialogs.addScript(handle, './UI/diff_match_patch/diff_match_patch.js');
		setTimeout(async () => {
			await dialogs.addScript(handle, './UI/codemirror/addon/merge/merge.js');
			await dialogs.addScript(handle, './UI/codemirror/mode/markdown/markdown.js');
			await dialogs.addScript(handle, './UI/index.js');
		}, 1000);
		await dialogs.open(handle);
		/*setTimeout(async () => {
		}, 1000);*/
		//const result = await dilgPromise;
		//console.dir(result);

		console.info('Conflict Resolution Plugin loaded!');
	},
});
