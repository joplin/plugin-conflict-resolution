const JoplinViewsDialogs = require("./../api/JoplinViewsDialogs.d.ts");
const JoplinData = require("./../api/JoplinData.d.ts");
import { NoteSelectWindow } from "../src/NoteSelectWindow";
import { notesPageOne, notesPageTwo } from "./assets/notes.data";

/* JOPLIN API MOCK */
const mockedDialogApi = {
    create: jest.fn(),
    addScript: jest.fn(),
    setHtml: jest.fn(),
    open: jest.fn()
}
jest.mock("./../api/JoplinViewsDialogs.d.ts", () => {
    return jest.fn().mockImplementation(() => {
        return {
            create: mockedDialogApi.create,
            addScript: mockedDialogApi.addScript,
            setHtml: mockedDialogApi.setHtml,
            open: mockedDialogApi.open
        };
    });
});

const mockedDataApi = {
    get: jest.fn()
}
jest.mock("./../api/JoplinData.d.ts", () => {
    return jest.fn().mockImplementation(() => {
        return {
            get: mockedDataApi.get
        };
    });
});

const fs = require('fs');
jest.mock('fs');

describe('NoteSelectWindow', () => {
    
    const mockedJoplinDialogs = new JoplinViewsDialogs();
    const mockedJoplinData = new JoplinData();

    mockedDialogApi.create.mockResolvedValue("test-dialog-id");
    fs.readFile.mockResolvedValue("<form></form>");
    mockedDialogApi.open.mockResolvedValue({
        id: 'ok',
        formData: {
            noteSelectForm: {
                noteSelect: '6d8c895238114637b63ed54149a4dd84'
            }
        }
    });
    mockedDataApi.get.mockImplementation((arr, obj) => {
        if(arr[0] === 'folders') {
            if(arr[1] === "8c0d6c64f37f409ba4edf517bab861b5") {
                return {
                    title: "Test Folder 1",
                    parent_id: ""
                };
            } else if(arr[1] === "673f0783febc4ead8187727781ab3b32") {
                return {
                    title: "Test Folder 2",
                    parent_id: "8c0d6c64f37f409ba4edf517bab861b5"
                };
            } else if(arr[1] === "deab7b3f223a4a1daf26cea675beb674") {
                return {
                    title: "Test Folder 3",
                    parent_id: "673f0783febc4ead8187727781ab3b32"
                };
            } else if(arr[1] === "e3f8e3c80a0f4a029b35bcd82ef46a06") {
                return {
                    title: "Test Folder 4",
                    parent_id: ""
                };
            }
        } else if(arr[0] == 'notes') {
            if(obj.page && obj.page == 2) {
                return {
                    items: notesPageOne,
                    has_more:true
                };
            } else {
                return {
                    items: notesPageTwo,
                    has_more: false
                };
            }
        }
    });


    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should test get notes function", async () => {
        const dialog = new NoteSelectWindow(mockedJoplinDialogs, mockedJoplinData, fs, "D:");
        const res = await dialog.getNotes();
        expect(res).toMatchSnapshot("getNotesSnapshot");
    });

    it("should setup the dialog properly", async () => {        
        const dlg = new NoteSelectWindow(mockedJoplinDialogs, mockedJoplinData, fs, "D:");
        
        await dlg.init("abc123");
        expect(mockedDialogApi.create).toBeCalledWith("abc123");
        expect(mockedDialogApi.addScript).toBeCalledTimes(2);
        expect(mockedDialogApi.addScript).toBeCalledWith("test-dialog-id", "./ui/NoteSelectWindow/index.js")
        expect(mockedDialogApi.addScript).toBeCalledWith("test-dialog-id", "./ui/NoteSelectWindow/index.css")
    });

    it("should test the dialog having correct html", async () => {
        const dlg = new NoteSelectWindow(mockedJoplinDialogs, mockedJoplinData, fs, "D:");
        dlg.init("abc123");
        await dlg.openDialog();
        expect(mockedDialogApi.setHtml).toBeCalledTimes(1);
        expect(mockedDialogApi.setHtml.mock.calls[0][0]).toBe("test-dialog-id");
        expect(mockedDialogApi.setHtml.mock.calls[0][1]).toMatchSnapshot("setHtmlFirstSnapshot");
    });

    it("should test ok result", async() => {
        const dlg = new NoteSelectWindow(mockedJoplinDialogs, mockedJoplinData, fs, "D:");
        dlg.init("abc123");
        const res = await dlg.openDialog();
        expect(res).toBe("6d8c895238114637b63ed54149a4dd84");  // This is the note id that is returned by the mocked .open() function.
    });

    it("should raise an error when response doesn't have any note selected", async () => {
        const dlg = new NoteSelectWindow(mockedJoplinDialogs, mockedJoplinData, fs, "D:");
        dlg.init("abc123");
        mockedDialogApi.open.mockResolvedValueOnce({
            id: "ok",
            result: {
                formData: {
                    noteSelectForm: {
                        noteSelect: undefined
                    }
                }
            }
        });

        expect.assertions(1);
        try {
            await dlg.openDialog();
        } catch(e) {
            expect(e).toMatchSnapshot("noNoteSelectedError");
        }
    });

    it("should return empty string if user hits cancel", async () => {
        const dlg = new NoteSelectWindow(mockedJoplinDialogs, mockedJoplinData, fs, "D:");
        dlg.init("abc123");
        mockedDialogApi.open.mockResolvedValueOnce({
            id: "cancel"
        });
        const res = await dlg.openDialog();
        expect(res).toBe("");
    });
});
