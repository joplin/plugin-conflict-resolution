import joplin from 'api';

joplin.plugins.register({
	onStart: async function() {
		const dialogs = joplin.views.dialogs;
		
		// DEBUG
		const handle = await dialogs.create("conflictRes-mainDialog");
		await dialogs.setHtml(handle, `<div id="conflictRes-Editor"></div>`);
		await dialogs.addScript(handle, './UI/index.css');
		await dialogs.addScript(handle, './UI/index.js');
		const result = await dialogs.open(handle);
		console.dir(result);

		console.info('Conflict Resolution Plugin loaded!');
	},
});
