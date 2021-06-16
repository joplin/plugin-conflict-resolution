import JoplinData from "api/JoplinData";
import JoplinViewsDialogs from "api/JoplinViewsDialogs";

export class DiffWindow {
    
    private dialogsApi : JoplinViewsDialogs;
    private dataApi : JoplinData;
    private installDir : string;
    private fileSys;
    
    constructor(dilg : JoplinViewsDialogs, data : JoplinData, fileSys, installDir : string) {
        this.dialogsApi = dilg;
        this.dataApi = data;
        this.installDir = installDir;
        this.fileSys = fileSys;
    }


    private handle: string = "";
    
    public async Init(id : string) {
        this.handle = await this.dialogsApi.create(id);
		await this.dialogsApi.addScript(this.handle, './UI/codemirror/lib/codemirror.js');
		await this.dialogsApi.addScript(this.handle, './UI/codemirror/lib/codemirror.css');
		await this.dialogsApi.addScript(this.handle, './UI/diff_match_patch/diff_match_patch.js');
		await this.dialogsApi.addScript(this.handle, './UI/index.js');
		await this.dialogsApi.addScript(this.handle, './UI/codemirror/addon/merge/merge.css');
		await this.dialogsApi.addScript(this.handle, './UI/index.css');
		await this.dialogsApi.setButtons(this.handle, [
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
        const localNote = await this.dataApi.get(['notes', noteId], {
            fields: ['is_conflict', 'conflict_original_id', 'body', 'title']
        });
    
        if(localNote.is_conflict === 0) {
            throw new Error('This is not a conflict note.');
        }
    
        if(localNote.conflict_original_id.length === 0 && compareWithId == "") {
            throw new Error('A note must be specificed to be compared with in case of missing original id.');
        }
    
        const remoteId = (compareWithId == "" ? localNote.conflict_original_id : compareWithId);

        const remoteNote = await this.dataApi.get(['notes', remoteId], {
            fields: ['body', 'title']
        });
    
        const remoteNoteContent = remoteNote.body.replace(/"/g, '&quot;');
        const localNoteContent = localNote.body.replace(/"/g, '&quot;');
        const remoteNoteTitle = remoteNote.title.replace(/"/g, '&quot;');
        const localNoteTitle = localNote.title.replace(/"/g, '&quot;');
    
        const htmlContents = await new Promise((res, rej) => {
            this.fileSys.readFile(this.installDir + '/UI/index.html', (err: Error, data: string) => {
                if(err) {
                    return rej(err);
                }
                res(data);
            });
        });

        // These inputs are a simple hack in order to pass data into the WebView.
        await this.dialogsApi.setHtml(this.handle, `
            <input id="pluginInstallDir" type="hidden" value="${this.installDir}"/> 
            <input id="remoteNote" type="hidden" value="${remoteNoteContent}"/> 
            <input id="curNote" type="hidden" value="${localNoteContent}"/> 
            <input id="remoteTitle" type="hidden" value="${remoteNoteTitle}"/> 
            <input id="curTitle" type="hidden" value="${localNoteTitle}"/> 
            ${htmlContents}
        `);
    
        let response = await this.dialogsApi.open(this.handle);
        return response;
    }
}