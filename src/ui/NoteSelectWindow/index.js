setTimeout(init, 5, 10);

function init() {
    const notesList = JSON.parse(document.getElementById("notesList").value);

    let notesObject = {};
    let orderedNotebooks = [];

    notesList.forEach(note => {
        if(notesObject[note.folderName] === undefined) {
            notesObject[note.folderName] = [];
            orderedNotebooks.push(note.folderName);
        }

        notesObject[note.folderName].push({
            id: note.id,
            title: note.title == "" ? "Untitled" : note.title
        });
    });

    const selectItem = document.getElementById("noteSelect");

    for(const folder of orderedNotebooks) {
        const groupHtml = document.createElement("optgroup");
        groupHtml.setAttribute("label", folder);
        notesObject[folder].forEach(note => {
            const noteHtml = document.createElement("option");
            noteHtml.setAttribute("value", note.id);
            noteHtml.innerText = note.title;
            groupHtml.appendChild(noteHtml);
        });
        selectItem.appendChild(groupHtml);
    }
}