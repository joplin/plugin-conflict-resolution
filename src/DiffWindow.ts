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

    public async OpenWindow(noteId: string, compareWithId : string = "") {
        const localNote = await this.joplinData.get(['notes', noteId], {
            fields: ['is_conflict', 'conflict_original_id', 'body', 'title']
        });
    
        if(localNote.is_conflict === 0) {
            throw new Error('This is not a conflict note.');
        }
    
        if(localNote.conflict_original_id.length === 0 && compareWithId == "") {
            throw new Error('A note must be specificed to be compared with in case of missing original id.');
        }
    
        const remoteId = (compareWithId == "" ? localNote.conflict_original_id : compareWithId);

        const remoteNote = await this.joplinData.get(['notes', remoteId], {
            fields: ['body', 'title']
        });
    
        const remoteNoteContent = remoteNote.body.replace(/"/g, '&quot;');
        const localNoteContent = localNote.body.replace(/"/g, '&quot;');
        const remoteNoteTitle = remoteNote.title.replace(/"/g, '&quot;');
        const localNoteTitle = localNote.title.replace(/"/g, '&quot;');
    
        const htmlContents = await new Promise((res, rej) => {
            this.fileSystem.readFile(this.joplinInstallDir + '/ui/DiffWindow/index.html', (err: Error, data: string) => {
                if(err) {
                    return rej(err);
                }
                res(data);
            });
        });

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