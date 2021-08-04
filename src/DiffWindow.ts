import {encode} from 'html-entities';
import JoplinData from 'api/JoplinData';
import JoplinViewsDialogs from 'api/JoplinViewsDialogs';

/**
 *  A window that shows the differences between two notes.
 */
export class DiffWindow {
    private joplinDialogs : JoplinViewsDialogs;
    private joplinData : JoplinData;
    private joplinInstallDir : string;
    private fileSystem;

    /**
     * Creates an instance of DiffWindow.
     * @param {JoplinViewsDialogs} joplinDialogs The Joplin dialogs API.
     * @param {JoplinData} joplinData The Joplin data API.
     * @param {any} fileSystem FS library
     * @param {string} joplinInstallDir The directory where the plugin is installed. Usually retreived from `joplin.plugins.installationDir()`.
     */
    constructor(joplinDialogs : JoplinViewsDialogs, joplinData : JoplinData, fileSystem, joplinInstallDir : string) {
        this.joplinDialogs = joplinDialogs;
        this.joplinData = joplinData;
        this.joplinInstallDir = joplinInstallDir;
        this.fileSystem = fileSystem;
    }


    private handle: string = '';

    /**
     * Inits the dialog for the diff window.
     * @param {string} id An identifier for the dialog.
     */
    public async init(id : string) {
        this.handle = await this.joplinDialogs.create(id);
        await this.joplinDialogs.addScript(this.handle, './lib/codemirror/lib/codemirror.js');
        await this.joplinDialogs.addScript(this.handle, './lib/codemirror/lib/codemirror.css');
        await this.joplinDialogs.addScript(this.handle, './lib/diff_match_patch/diff_match_patch.js');
        await this.joplinDialogs.addScript(this.handle, './lib/codemirror/addon/merge/merge.css');
        await this.joplinDialogs.addScript(this.handle, './ui/DiffWindow/index.js');
        await this.joplinDialogs.addScript(this.handle, './ui/DiffWindow/index.css');
        await this.joplinDialogs.setButtons(this.handle, [
            {
                id: 'submit',
                title: 'Save',
            },
            {
                id: 'cancel',
                title: 'Cancel',
            },
        ]);

        try {
            await this.joplinDialogs.setFitToContent(this.handle, false);
        } catch {
            // If an exception occurs, that means setFitToContent failed, and we must add the CSS to support old versions.
            // The below CSS files basically overrides the changes needed to make the CSS work without setFitToContent.
            console.log('Concflict Resolution: Error setting fitToContent, injecting old styling instead.');
            await this.joplinDialogs.addScript(this.handle, './ui/DiffWindow/index-old.css');
        }
    }

    /**
     * Opens the diff window between 2 different notes and returns the merged result as a string.
     *
     * @param {string} noteId The ID of the base note which will be saved eventually.
     * @param {string} compareWithId The ID of the note that we should compare to.
     * @return {DiffResult | null} `null` if the merge was cancelled. Otherwise, the contents of the merged notes.
     */
    public async openWindow(noteId: string, compareWithId : string) : Promise<DiffResult | null> {
        const localNote = await this.joplinData.get(['notes', noteId], {
            fields: ['body', 'title'],
        });

        const remoteNote = await this.joplinData.get(['notes', compareWithId], {
            fields: ['body', 'title'],
        });

        const remoteNoteContent = encode(remoteNote.body);
        const localNoteContent = encode(localNote.body);
        const remoteNoteTitle = encode(remoteNote.title);
        const localNoteTitle = encode(localNote.title);

        const htmlContents = await this.fileSystem.readFile(this.joplinInstallDir + '/ui/DiffWindow/index.html');

        // These inputs are a simple hack in order to pass data into the WebView.
        await this.joplinDialogs.setHtml(this.handle, `
            <input id="pluginInstallDir" type="hidden" value="${this.joplinInstallDir}"/> 
            <input id="remoteNote" type="hidden" value="${remoteNoteContent}"/> 
            <input id="curNote" type="hidden" value="${localNoteContent}"/> 
            <input id="remoteTitle" type="hidden" value="${remoteNoteTitle}"/> 
            <input id="curTitle" type="hidden" value="${localNoteTitle}"/> 
            ${htmlContents}
        `);

        const response = await this.joplinDialogs.open(this.handle);
        if (response.id === 'submit' && response.formData && response.formData.note && response.formData.note.newNoteContents && response.formData.note.newNoteTitle) {
            return {
                NoteContents: response.formData.note.newNoteContents,
                NoteTitle: response.formData.note.newNoteTitle,
            };
        }
        return null;
    }
}

export type DiffResult = {
    NoteContents : string;
    NoteTitle: string;
}
