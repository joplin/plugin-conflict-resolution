const installPath = document.getElementById('pluginInstallDir').value;
const remoteNote = document.getElementById('remoteNote').value;
const curNote = document.getElementById('curNote').value;
const remoteTitle = document.getElementById('remoteTitle').value;
const curTitle = document.getElementById('curTitle').value;
let myCodeMirror = null;

function log(message) {
    console.log(`Conflict Resolution Plugin: ` + message);
}

function mergeViewHeight(mergeView) {
    function editorHeight(editor) {
        if (!editor) return 0;
        return editor.getScrollInfo().height;
    }
    return Math.max(editorHeight(mergeView.leftOriginal()),
        editorHeight(mergeView.editor()),
        editorHeight(mergeView.rightOriginal()));
}

function resize(mergeView) {
    let height = mergeViewHeight(mergeView);
    for (;;) {
        if (mergeView.leftOriginal()) {
            mergeView.leftOriginal().setSize(null, height);
        }
        mergeView.editor().setSize(null, height);
        if (mergeView.rightOriginal()) {
            mergeView.rightOriginal().setSize(null, height);
        }

        const newHeight = mergeViewHeight(mergeView);
        if (newHeight >= height) break;
        else height = newHeight;
    }
    mergeView.wrap.style.height = height + 'px';
}

async function initCodeMirror(curTimeout) {
    // If CodeMirror hasn't loaded yet, restart the timer. The waiting time is increased exponentially.
    if (typeof CodeMirror === 'undefined') {
        log('Codemirror has not loaded yet, waiting...');
        setTimeout(initCodeMirror, curTimeout * 2, curTimeout * 2);
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

    // eslint-disable-next-line new-cap
    myCodeMirror = CodeMirror.MergeView(document.getElementById('conflictRes-Editor'), {
        origLeft: remoteNote,
        mode: 'markdown',
        lineNumbers: true,
        connect: 'align',
        value: curNote,
        lineWrapping: true,
    });

    /* AUTO RESIZE CODE */
    resize(myCodeMirror);

    window.onresize = () => {
        resize(myCodeMirror);
    };

    document.getElementById('titleLeft').value = remoteTitle;
    document.getElementById('titleRight').value = curTitle;

    if (document.getElementById('titleRight').value === document.getElementById('titleLeft').value) {
        document.getElementById('moveTitleButton').setAttribute('disabled', true);
    } else {
        document.getElementById('moveTitleButton').removeAttribute('disabled');
    }

    const newNoteContents = document.getElementById('newNoteContents');
    const newNoteTitle = document.getElementById('newNoteTitle');

    newNoteContents.value = curNote;
    myCodeMirror.editor().on('changes', () => {
        // Keep the noteContents input in sync with CodeMirror value.
        newNoteContents.value = myCodeMirror.editor().getDoc().getValue();
    });

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

    log('CodeMirror Window loaded successfully.');
}


// A timeout to make sure CodeMirror is loaded.
setTimeout(initCodeMirror, 1, 5);
