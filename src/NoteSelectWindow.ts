import JoplinData from "api/JoplinData";
import JoplinViewsDialogs from "api/JoplinViewsDialogs";

export class NoteSelectWindow {
    private joplinDialogs : JoplinViewsDialogs;
    private joplinData : JoplinData;
    private joplinInstallDir : string;
    private fileSystem;

    constructor(joplinDialogs : JoplinViewsDialogs, joplinData : JoplinData, fileSystem, joplinInstallDir : string) {
        this.joplinDialogs = joplinDialogs;
        this.joplinData = joplinData;
        this.fileSystem = fileSystem;
        this.joplinInstallDir = joplinInstallDir;
    }

    private handle : string = "";

    public async init(id : string) {
        this.handle = await this.joplinDialogs.create(id);
        await this.joplinDialogs.addScript(this.handle, "./lib/autocomplete.js/autoComplete.js");
        await this.joplinDialogs.addScript(this.handle, "./ui/NoteSelectWindow/index.js");
        await this.joplinDialogs.addScript(this.handle, "./lib/autocomplete.js/css/autoComplete.02.css");
        await this.joplinDialogs.addScript(this.handle, "./ui/NoteSelectWindow/index.css");
    }

    public async openDialog() {

        const notesList = await this.getNotes();
        const escapedJSON = JSON.stringify(notesList).replace(/"/g, '&quot;');

        const htmlContents = await this.fileSystem.readFile(this.joplinInstallDir + "/ui/NoteSelectWindow/index.html");
        await this.joplinDialogs.setHtml(this.handle, `
            <input id="notesList" type="hidden" value="${escapedJSON}" />
            ${htmlContents}
        `);

        return this.joplinDialogs.open(this.handle);
    }

    private async getNotes() {
        const notes = await this.joplinData.get(['notes'], { fields: ['parent_id', 'title'] });
 
        // TODO: Handle the hasMore attribute!
        let notesList = [];
        for(const note of notes.items) {
            let curFolder = await this.joplinData.get(['folders', note.parent_id], { fields: ['title'] });
            notesList.push({
                title: note.title,
                folderName: curFolder.title
            });
        }

        return notesList;
    }
}