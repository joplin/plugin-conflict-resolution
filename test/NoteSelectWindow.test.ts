const JoplinViewsDialogs = require("./../api/JoplinViewsDialogs.d.ts");
import { NoteSelectWindow } from "../src/NoteSelectWindow";

/* JOPLIN API MOCK */
const mockedDialogApi = {
    create: jest.fn().mockResolvedValue("testId"),
    addScript: jest.fn()
}
jest.mock("./../api/JoplinViewsDialogs.d.ts", () => {
    return jest.fn().mockImplementation(() => {
        return {
            create: mockedDialogApi.create,
            addScript: mockedDialogApi.addScript
        };
    });
});



describe('NoteSelectWindow', () => {
    
    const mockedJoplinDialogs = new JoplinViewsDialogs();

    it("dfdf", async () => {
        
        let dlg = new NoteSelectWindow(mockedJoplinDialogs, null, null, "");
        await dlg.init("sdfsdf");
        expect(mockedDialogApi.create).toBeCalledWith("sdfsdf");
    });
});
