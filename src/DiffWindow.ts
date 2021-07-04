import {encode} from 'html-entities';
import JoplinData from "api/JoplinData";
import JoplinViewsDialogs from "api/JoplinViewsDialogs";

export class DiffWindow {

    private joplinDialogs : JoplinViewsDialogs;
    private joplinData : JoplinData;
    private joplinInstallDir : string;
    private fileSystem;

    constructor(joplinDialogs : JoplinViewsDialogs, joplinData : JoplinData, fileSystem, joplinInstallDir : string) {
        this.joplinDialogs = joplinDialogs;
        this.joplinData = joplinData;
        this.joplinInstallDir = joplinInstallDir;
        this.fileSystem = fileSystem;
    }


    private handle: string = "";
    
    public async Init(id : string) {
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
				title: 'Save'
			},
			{
				id: 'cancel',
				title: 'Cancel'
			}
		]);
    }

    /**
     * Opens the diff window between 2 different notes and returns the merged result as a string.
     * 
     * @param noteId The ID of the base note which will be saved eventually.
     * @param compareWithId The ID of the note that we should compare to.
     * @returns `null` if the merge was cancelled. Otherwise, the contents of the merged notes. 
     */
    public async OpenWindow(noteId: string, compareWithId : string) : Promise<DiffResult> {
        const localNote = await this.joplinData.get(['notes', noteId], {
            fields: ['body', 'title']
        });

        const remoteNote = await this.joplinData.get(['notes', compareWithId], {
            fields: ['body', 'title']
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
        if(response.id == "submit" && response.formData && response.formData.note && response.formData.note.newNoteContents && response.formData.note.newNoteTitle) {
            return {
                NoteContents: response.formData.note.newNoteContents,
                NoteTitle: response.formData.note.newNoteTitle
            };
        }
        return null;
    }
}

export type DiffResult = {
    NoteContents : string;
    NoteTitle: string;
}