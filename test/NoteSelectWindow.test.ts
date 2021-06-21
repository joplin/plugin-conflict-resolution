import JoplinData from "api/JoplinData";
import JoplinViewsDialogs from "api/JoplinViewsDialogs";
import { NoteSelectWindow } from "src/NoteSelectWindow";

jest.mock("./api/JoplinViewsDialogs");

beforeEach(() => {
    JoplinViewsDialogs.mockClear();
});

test("Should open a select window", () => {
    
});