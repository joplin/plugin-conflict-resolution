import {encode} from 'html-entities';
import JoplinData from 'api/JoplinData';
import JoplinViewsDialogs from 'api/JoplinViewsDialogs';

/**
 * A window that enables the user to select a note from a list of all notes.
 */
export class NoteSelectWindow {
    private joplinDialogs : JoplinViewsDialogs;
    private joplinData : JoplinData;
    private joplinInstallDir : string;
    private fileSystem;

    /**
     * Create an instance of the select window.
     * @param {JoplinViewsDialogs} joplinDialogs The Joplin dialogs API.
     * @param {JoplinData} joplinData The Joplin data API.
     * @param {any} fileSystem FS library
     * @param {string} joplinInstallDir The directory where the plugin is installed. Usually retreived from `joplin.plugins.installationDir()`.
     */
    constructor(joplinDialogs : JoplinViewsDialogs, joplinData : JoplinData, fileSystem, joplinInstallDir : string) {
        this.joplinDialogs = joplinDialogs;
        this.joplinData = joplinData;
        this.fileSystem = fileSystem;
        this.joplinInstallDir = joplinInstallDir;
    }

    private handle : string = '';

    /**
     * Inits the dialog for the select window.
     * @param {string} id An identifier for the dialog.
     */
    public async init(id : string) {
        this.handle = await this.joplinDialogs.create(id);
        await this.joplinDialogs.addScript(this.handle, './ui/NoteSelectWindow/index.js');
        await this.joplinDialogs.addScript(this.handle, './ui/NoteSelectWindow/index.css');
    }

    /**
     * Shows a window to select a note from all notes in all notebooks.
     * @return {string} the id of the selected note. Will raise an error if none was selected.
     */
    public async openDialog() : Promise<string> {
        const notesList = await this.getNotes();
        const escapedJSON = encode(JSON.stringify(notesList));

        const htmlContents = await this.fileSystem.readFile(this.joplinInstallDir + '/ui/NoteSelectWindow/index.html');
        await this.joplinDialogs.setHtml(this.handle, `
            <input id="notesList" type="hidden" value="${escapedJSON}" />
            ${htmlContents}
        `);

        const result = await this.joplinDialogs.open(this.handle);

        if (result.id !== 'ok') {
            return '';
        }

        if (result === undefined || result.formData === undefined || result.formData.noteSelectForm === undefined || result.formData.noteSelectForm.noteSelect === undefined) {
            throw new Error('No note was selected!');
        }

        return result.formData.noteSelectForm.noteSelect;
    }

    /**
     * Creates a 1D array of all notes. The foldername is created recursively to show where a note is.
     * @return {Promise<NoteData[]>} An array of all notes.
     */
    public async getNotes() : Promise<NoteData[]> {
        const notes = [];

        let notesRespone = await this.joplinData.get(['notes'], {fields: ['parent_id', 'title', 'id'], order_by: 'updated_time', order_dir: 'DESC'});
        notes.push(...notesRespone.items);
        let curPage = 1;
        while (notesRespone.has_more === true) {
            notesRespone = await this.joplinData.get(['notes'], {fields: ['parent_id', 'title', 'id'], order_by: 'updated_time', order_dir: 'DESC', page: (++curPage)});
            notes.push(...notesRespone.items);
        }

        const notesList : NoteData[] = [];
        for (const note of notes) {
            let currentParent = note.parent_id;
            let curFolderTitle = '';
            while (currentParent !== '') {
                if (curFolderTitle !== '') {
                    curFolderTitle = ' / ' + curFolderTitle;
                }
                const curFolder = await this.joplinData.get(['folders', currentParent], {fields: ['title', 'parent_id']});
                curFolderTitle = curFolder.title + curFolderTitle;
                currentParent = curFolder.parent_id;
            }

            notesList.push({
                id: note.id,
                title: note.title,
                folderName: curFolderTitle,
            });
        }

        return notesList;
    }
}

export type NoteData = {
    id: string,
    title: string,
    folderName: string
}
