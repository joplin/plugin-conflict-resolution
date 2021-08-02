const installPath = document.getElementById('pluginInstallDir').value;
const remoteNote = document.getElementById('remoteNote').value;
const curNote = document.getElementById('curNote').value;
const remoteTitle = document.getElementById('remoteTitle').value;
const curTitle = document.getElementById('curTitle').value;
let myCodeMirror = null;


let lineWrappingStatus = true;
let alignStatus = true;
let collapseLines = false;

const newNoteContents = document.getElementById('newNoteContents');
const newNoteTitle = document.getElementById('newNoteTitle');

function log(message) {
    console.log(`Conflict Resolution Plugin: ` + message);
}

function resizeCodeMiror(mergeView) {
    const height = document.getElementById('conflictRes-Editor').getBoundingClientRect().height;
    if (mergeView.leftOriginal()) {
        mergeView.leftOriginal().setSize(null, height);
    }
    mergeView.editor().setSize(null, height);
    if (mergeView.rightOriginal()) {
        mergeView.rightOriginal().setSize(null, height);
    }
    mergeView.wrap.style.height = height + 'px';
}

function initCodeMirror(value) {
    document.getElementById('conflictRes-Editor').innerHTML = '';

    // eslint-disable-next-line new-cap
    myCodeMirror = CodeMirror.MergeView(document.getElementById('conflictRes-Editor'), {
        origLeft: remoteNote,
        mode: 'markdown',
        lineNumbers: true,
        connect: alignStatus ? 'align' : null,
        value: value,
        lineWrapping: lineWrappingStatus,
        collapseIdentical: collapseLines ? 3 : false,
    });

    resizeCodeMiror(myCodeMirror);

    newNoteContents.value = value;
    myCodeMirror.editor().on('changes', () => {
        // Keep the noteContents input in sync with CodeMirror value.
        newNoteContents.value = myCodeMirror.editor().getDoc().getValue();
    });
}

async function init(curTimeout) {
    // If CodeMirror hasn't loaded yet, restart the timer. The waiting time is increased exponentially.
    if (typeof CodeMirror === 'undefined') {
        log('Codemirror has not loaded yet, waiting...');
        setTimeout(init, curTimeout * 2, curTimeout * 2);
        return;
    }

    log('Initing codemirror instance.');

    // These scripts have to be loaded here in order to ensure Codemirror.js is already loaded by now.
    const script = document.createElement('script');
    const script2 = document.createElement('script');
    script.src = installPath + '/lib/codemirror/mode/markdown/markdown.js';
    script2.src = installPath + '/lib/codemirror/addon/merge/merge.js';

    // This is needed because I have to wait for both the scripts to load before I do anything.
    const promises = [
        new Promise((res) => {
            script.onload = function() {
                res();
            };
        }),
        new Promise((res) => {
            script2.onload = function() {
                res();
            };
        }),
    ];

    document.head.appendChild(script);
    document.head.appendChild(script2);

    await Promise.all(promises);

    document.getElementById('titleLeft').value = remoteTitle;
    document.getElementById('titleRight').value = curTitle;

    if (document.getElementById('titleRight').value === document.getElementById('titleLeft').value) {
        document.getElementById('moveTitleButton').setAttribute('disabled', true);
    } else {
        document.getElementById('moveTitleButton').removeAttribute('disabled');
    }

    newNoteTitle.value = document.getElementById('titleRight').value;
    document.getElementById('titleRight').addEventListener('input', () => {
        // Same for the title as above. Keep it in sync.
        newNoteTitle.value = document.getElementById('titleRight').value;
        document.getElementById('moveTitleButton').removeAttribute('disabled');
    });

    document.getElementById('moveTitleButton').addEventListener('click', (ev) => {
        document.getElementById('titleRight').value = document.getElementById('titleLeft').value;
        document.getElementById('moveTitleButton').setAttribute('disabled', true);
    });

    initCodeMirror(curNote);

    window.onresize = () => {
        resizeCodeMiror(myCodeMirror);
    };

    // Handle button actions:
    document.getElementById('nextDiffButton').addEventListener('click', () => {
        myCodeMirror.edit.execCommand('goNextDiff');
        myCodeMirror.edit.focus();
    });
    document.getElementById('prevDiffButton').addEventListener('click', () => {
        myCodeMirror.edit.execCommand('goPrevDiff');
        myCodeMirror.edit.focus();
    });
    document.getElementById('acceptAllButton').addEventListener('click', () => {
        myCodeMirror.edit.setValue(remoteNote);
    });

    document.getElementById('collapseButton').addEventListener('click', () => {
        collapseLines = !collapseLines;

        // For some reason, CodeMirror doesn't have API to configure this after init, so we must repeat.
        initCodeMirror(newNoteContents.value);
    });
    document.getElementById('alignButton').addEventListener('click', () => {
        alignStatus = !alignStatus;

        // For some reason, CodeMirror doesn't have API to configure this after init, so we must repeat.
        initCodeMirror(newNoteContents.value);
    });
    document.getElementById('wrapLinesButton').addEventListener('click', () => {
        lineWrappingStatus = !lineWrappingStatus;
        myCodeMirror.edit.setOption('lineWrapping', lineWrappingStatus);
    });

    log('CodeMirror Window loaded successfully.');
}


// A timeout to make sure CodeMirror is loaded.
setTimeout(init, 1, 5);
