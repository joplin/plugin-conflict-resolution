const JoplinViewsDialogs = require("./../api/JoplinViewsDialogs.d.ts");
const JoplinData = require("./../api/JoplinData.d.ts");
import { NoteSelectWindow } from "../src/NoteSelectWindow";

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
                    items:[
                        {
                            "parent_id":"8c0d6c64f37f409ba4edf517bab861b5",
                            "title":"gasserrrrrr",
                            "id":"3667da1054814e3c90d755d26a685a37"
                        },
                        {
                            "parent_id":"673f0783febc4ead8187727781ab3b32",
                            "title":"dg",
                            "id":"f57154854b4c424789bc47cfe2dee85e"
                        },
                        {
                            "parent_id":"673f0783febc4ead8187727781ab3b32",
                            "title":"rwerw",
                            "id":"6355692b5ed2420cbcdfa3b717f9bc8e"
                        },
                        {
                            "parent_id":"8c0d6c64f37f409ba4edf517bab861b5",
                            "title":"sdfsd",
                            "id":"6965f828d1ae4d40acf0a86caa3bec31"
                        },
                        {
                            "parent_id":"8c0d6c64f37f409ba4edf517bab861b5",
                            "title":"sdf",
                            "id":"c00715506623400fab95f62aadf1797a"
                        },
                        {
                            "parent_id":"8c0d6c64f37f409ba4edf517bab861b5",
                            "title":"sd",
                            "id":"fafa879c78aa4977b92b63bbb5859ee8"
                        },
                        {
                            "parent_id":"8c0d6c64f37f409ba4edf517bab861b5",
                            "title":"",
                            "id":"21e6b6eb59fe4284bbdc00cd571851c8"
                        },
                        {
                            "parent_id":"8c0d6c64f37f409ba4edf517bab861b5",
                            "title":"fgerg",
                            "id":"af3d3732f3eb4cb79f334077f73b26da"
                        },
                        {
                            "parent_id":"8c0d6c64f37f409ba4edf517bab861b5",
                            "title":"g",
                            "id":"a7e4bda6fc54415082260a3d4270c568"
                        }
                    ],
                    has_more:true
                };
            } else {
                return {
                    items: [{
                        "parent_id": "8c0d6c64f37f409ba4edf517bab861b5",
                        "title": "g",
                        "id": "f78f5b7f72634a1190af2f17b1e8d96c"
                    },
                    {
                        "parent_id": "8c0d6c64f37f409ba4edf517bab861b5",
                        "title": "",
                        "id": "c4e21d6016584e27b3f30831994a2a6b"
                    },
                    {
                        "parent_id": "8c0d6c64f37f409ba4edf517bab861b5",
                        "title": "dg",
                        "id": "15f338dc3664487189fee5af0750d0d1"
                    },
                    {
                        "parent_id": "8c0d6c64f37f409ba4edf517bab861b5",
                        "title": "Ahmed",
                        "id": "b0f025664fa84645a3eaccb99209e0b8"
                    },
                    {
                        "parent_id": "deab7b3f223a4a1daf26cea675beb674",
                        "title": "Gasser Note",
                        "id": "a5548d09595b4baea839cd7d40ee4aa1"
                    },
                    {
                        "parent_id": "deab7b3f223a4a1daf26cea675beb674",
                        "title": "Anas Note",
                        "id": "8dc676bddd2b43cbbab197e426722ad9"
                    },
                    {
                        "parent_id": "e3f8e3c80a0f4a029b35bcd82ef46a06",
                        "title": "Conflict resolution plugin",
                        "id": "bd1a227764a944bab6eff29eb116e6a8"
                    },
                    {
                        "parent_id": "e3f8e3c80a0f4a029b35bcd82ef46a06",
                        "title": "Conflict resolution plugin",
                        "id": "6d8c895238114637b63ed54149a4dd84"
                    },
                    {
                        "parent_id": "deab7b3f223a4a1daf26cea675beb674",
                        "title": "Ahmed Note",
                        "id": "7fd64520f20548fb94356b032751e72f"
                    },
                    {
                        "parent_id": "e3f8e3c80a0f4a029b35bcd82ef46a06",
                        "title": "Test text is here.",
                        "id": "73e8d938c4d84951915278a54e0eacaf"
                    },
                    {
                        "parent_id": "e3f8e3c80a0f4a029b35bcd82ef46a06",
                        "title": "",
                        "id": "4cac336dc7ce4e449442ed535b93b085"
                    },
                    {
                        "parent_id": "e3f8e3c80a0f4a029b35bcd82ef46a06",
                        "title": "sdfsd",
                        "id": "2432b08c86b84fd9983bee4c42699ca8"
                    },
                    {
                        "parent_id": "e3f8e3c80a0f4a029b35bcd82ef46a06",
                        "title": "dfgdg",
                        "id": "9ad879e68da34a5c8420f45e77c096b6"
                    },
                    {
                        "parent_id": "e3f8e3c80a0f4a029b35bcd82ef46a06",
                        "title": "dsfsdf",
                        "id": "945d9edeba9a48ba90958af0f3c4c66b"
                    }],
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
