const JoplinViewsDialogs = require('./../api/JoplinViewsDialogs.d.ts');
const JoplinData = require('./../api/JoplinData.d.ts');
import {DiffWindow} from '../src/DiffWindow';

/* JOPLIN API MOCK */
const mockedDialogApi = {
    create: jest.fn(),
    addScript: jest.fn(),
    setHtml: jest.fn(),
    open: jest.fn(),
    setButtons: jest.fn(),
};
jest.mock('./../api/JoplinViewsDialogs.d.ts', () => {
    return jest.fn().mockImplementation(() => {
        return {
            create: mockedDialogApi.create,
            addScript: mockedDialogApi.addScript,
            setHtml: mockedDialogApi.setHtml,
            open: mockedDialogApi.open,
            setButtons: mockedDialogApi.setButtons,
        };
    });
});

const mockedDataApi = {
    get: jest.fn(),
};
jest.mock('./../api/JoplinData.d.ts', () => {
    return jest.fn().mockImplementation(() => {
        return {
            get: mockedDataApi.get,
        };
    });
});

const fs = require('fs');
jest.mock('fs');

describe('DiffWindow', () => {
    const mockedJoplinDialogs = new JoplinViewsDialogs();
    const mockedJoplinData = new JoplinData();

    mockedDialogApi.create.mockResolvedValue('test-dialog-id');
    fs.readFile.mockResolvedValue('<form></form>');

    mockedDialogApi.open.mockResolvedValue({
        id: 'submit',
        formData: {
            note: {
                newNoteContents: 'Final Contents',
                newNoteTitle: 'Final Title',
            },
        },
    });
    mockedDataApi.get.mockImplementation((arr, obj) => {
        if (arr[0] === 'notes') {
            if (arr[1] === '8c0d6c64f37f409ba4edf517bab861b5') {
                return {
                    title: 'Test Title',
                    body: 'Test Content',
                };
            } else if (arr[1] === '673f0783febc4ead8187727781ab3b32') {
                return {
                    title: 'Test Title 2',
                    body: 'Test Content 2',
                };
            }
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should setup the dialog properly', async () => {
        const dlg = new DiffWindow(mockedJoplinDialogs, mockedJoplinData, fs, 'D:');

        await dlg.init('abc123');
        expect(mockedDialogApi.create).toBeCalledWith('abc123');
        expect(mockedDialogApi.addScript).toBeCalledTimes(6);
        expect(mockedDialogApi.addScript.mock.calls).toMatchSnapshot('addScriptCalls');
        expect(mockedDialogApi.setButtons).toBeCalled();
        expect(mockedDialogApi.setButtons).toBeCalledWith('test-dialog-id', [
            {
                id: 'submit',
                title: 'Save',
            },
            {
                id: 'cancel',
                title: 'Cancel',
            },
        ]);
    });

    it('should test the dialog having correct html', async () => {
        const dlg = new DiffWindow(mockedJoplinDialogs, mockedJoplinData, fs, 'D:');
        dlg.init('abc123');

        await dlg.openWindow('8c0d6c64f37f409ba4edf517bab861b5', '673f0783febc4ead8187727781ab3b32');

        // This also checks that all the fields are set correctly, including titles, note contents and the html from index.html.
        expect(mockedDialogApi.setHtml.mock.calls[0]).toMatchSnapshot('dialogHtml');
    });

    it('should test ok result', async () => {
        const dlg = new DiffWindow(mockedJoplinDialogs, mockedJoplinData, fs, 'D:');
        dlg.init('abc123');
        const res = await dlg.openWindow('8c0d6c64f37f409ba4edf517bab861b5', '673f0783febc4ead8187727781ab3b32');
        expect(res).toStrictEqual({
            NoteContents: 'Final Contents',
            NoteTitle: 'Final Title',
        });
    });

    it('should test clicking cancel', async () => {
        const dlg = new DiffWindow(mockedJoplinDialogs, mockedJoplinData, fs, 'D:');
        dlg.init('abc123');
        mockedDialogApi.open.mockResolvedValueOnce({
            id: 'cancel',
        });
        const res = await dlg.openWindow('8c0d6c64f37f409ba4edf517bab861b5', '673f0783febc4ead8187727781ab3b32');
        expect(res).toBe(null);
    });
});
