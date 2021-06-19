setTimeout(init, 5, 10);

function init(timeout) {
    if(typeof autoComplete == 'undefined') {
        console.log('Waiting for autocomplete plugin to load...');
        return setTimeout(init, timeout * 2, timeout * 2);
    }

    const notesList = JSON.parse(document.getElementById("notesList").value);

    let keysList = [];
    let notesFormated = [];

    notesList.forEach(note => {
        if(!keysList.includes(note.folderName))
            keysList.push(note.folderName);
        let tmpObject = {};
        tmpObject[note.folderName] = note.title;
        notesFormated.push(tmpObject);
    });

    console.dir(keysList);
    console.dir(notesFormated);

    const autoCompleteJS = new autoComplete({
        placeHolder: "Search for Food...",
        data: {
            src: notesFormated,
            keys: keysList,
            cache: true,
        },
        resultItem: {
            highlight: true
        },
        events: {
            input: {
                selection: (event) => {
                    const selection = event.detail.selection.value;
                    autoCompleteJS.input.value = selection;
                }
            }
        }
    });
}