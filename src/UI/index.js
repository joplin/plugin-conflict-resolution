let installPath = document.getElementById("pluginInstallDir").value;
let origNote = document.getElementById("origNote").value;
let curNote = document.getElementById("curNote").value;
let myCodeMirror = null;

function log(message) {
    console.log(`Conflict Resolution Plugin: ` + message);
}

function initCodeMirror() {
    log('Initing codemirror instance...');

    // These scripts have to be loaded here in order to ensure Codemirror.js is already loaded by now.
    let script = document.createElement('script');
    let script2 = document.createElement('script');
    script.src = installPath + '/UI/codemirror/mode/markdown/markdown.js';
    script2.src = installPath + '/UI/codemirror/addon/merge/merge.js';

    script2.onload = function () {
        myCodeMirror = CodeMirror.MergeView(document.getElementById('conflictRes-Editor'), {
            origLeft: origNote,
            mode: 'markdown',
            lineNumbers: true,
            connect: 'align',
            value: curNote,
            lineWrapping: true
        });
    }

    document.head.appendChild(script);
    document.head.appendChild(script2);
}

// TODO: find a better way to wait for document load.
// simple window.onload didn't work.
setTimeout(initCodeMirror, 100);