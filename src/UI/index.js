let installPath = document.getElementById("pluginInstallDir").value;
let origNote = document.getElementById("origNote").value;
let curNote = document.getElementById("curNote").value;
let myCodeMirror = null;

function log(message) {
    console.log(`Conflict Resolution Plugin: ` + message);
}

async function initCodeMirror() {
    log('Initing codemirror instance...');

    // These scripts have to be loaded here in order to ensure Codemirror.js is already loaded by now.
    let script = document.createElement('script');
    let script2 = document.createElement('script');
    script.src = installPath + '/UI/codemirror/mode/markdown/markdown.js';
    script2.src = installPath + '/UI/codemirror/addon/merge/merge.js';

    // This is needed because I have to wait for both the scripts to load before I do anything.
    let promises = [
        new Promise((res) => {
            script.onload = function () {
                res();
            }
        }),
        new Promise((res) => {
            script2.onload = function () {
                res();
            }
        })
    ];

    document.head.appendChild(script);
    document.head.appendChild(script2);

    await Promise.all(promises);
    
    myCodeMirror = CodeMirror.MergeView(document.getElementById('conflictRes-Editor'), {
        origLeft: origNote,
        mode: 'markdown',
        lineNumbers: true,
        connect: 'align',
        value: curNote,
        lineWrapping: true
    });
}

// TODO: find a better way to wait for document load.
// simple window.onload didn't work.
setTimeout(initCodeMirror, 100);