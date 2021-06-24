import JoplinData from "api/JoplinData";
import { NoteSelectWindow } from "src/NoteSelectWindow";

jest.mock("./../api/JoplinViewsDialogs.d.ts");
const JoplinViewsDialogs = require("./../api/JoplinViewsDialogs.d.ts");

/*JoplinViewsDialogs.mockImplementation(() => {
    return {
        create: jest.fn(),
        showMessageBox: jest.fn(),
        setHtml: jest.fn(),
        addScript: jest.fn(),
        setButtons: jest.fn(),
        open: jest.fn()
    };
});*/

test("Should open a select window", () => {
    let dialogsApi = new JoplinViewsDialogs();
    //let wind = new NoteSelectWindow(dialogsApi, JoplinData, fs, "");
});