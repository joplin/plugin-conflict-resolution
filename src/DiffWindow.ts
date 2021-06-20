import JoplinData from "api/JoplinData";
import JoplinViewsDialogs from "api/JoplinViewsDialogs";
import { NoteSelectWindow } from "./NoteSelectWindow";

export class DiffWindow {
    
    private joplinDialogs : JoplinViewsDialogs;
    private joplinData : JoplinData;
    private joplinInstallDir : string;
    private fileSystem;
    private noteSelectWindow : NoteSelectWindow;

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

        this.noteSelectWindow = new NoteSelectWindow(this.joplinDialogs, this.joplinData, this.fileSystem, this.joplinInstallDir);
        await this.noteSelectWindow.init("dialog-note-select");
    }

    public async OpenWindow(noteId: string, compareWithId : string = "") {
        const localNote = await this.joplinData.get(['notes', noteId], {
            fields: ['is_conflict', 'conflict_original_id', 'body', 'title']
        });
    
        if(localNote.is_conflict === 0) {
            throw new Error('This is not a conflict note.');
        }
    
        if(localNote.conflict_original_id === "" && compareWithId === "") {
            compareWithId = await this.noteSelectWindow.openDialog();
        }
    
        const remoteId = (compareWithId == "" ? localNote.conflict_original_id : compareWithId);

        const remoteNote = await this.joplinData.get(['notes', remoteId], {
            fields: ['body', 'title']
        });
    
        const remoteNoteContent = remoteNote.body.replace(/"/g, '&quot;');
        const localNoteContent = localNote.body.replace(/"/g, '&quot;');
        const remoteNoteTitle = remoteNote.title.replace(/"/g, '&quot;');
        const localNoteTitle = localNote.title.replace(/"/g, '&quot;');
    
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
        return response;
    }
}