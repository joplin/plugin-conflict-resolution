let installPath = document.getElementById("pluginInstallDir").value;
let remoteNote = document.getElementById("remoteNote").value;
let curNote = document.getElementById("curNote").value;
let remoteTitle = document.getElementById("remoteTitle").value;
let curTitle = document.getElementById("curTitle").value;
let myCodeMirror = null;

function log(message) {
    console.log(`Conflict Resolution Plugin: ` + message);
}

async function initCodeMirror(curTimeout) {

    // If CodeMirror hasn't loaded yet, restart the timer. The waiting time is increased exponentially.
    if(CodeMirror == undefined) {
        log('Codemirror has not loaded yet, waiting...');
        setTimeout(initCodeMirror, curTimeout * 2, curTimeout * 2);
    }

    log('Initing codemirror instance.');

    // These scripts have to be loaded here in order to ensure Codemirror.js is already loaded by now.
    let script = document.createElement('script');
    let script2 = document.createElement('script');
    script.src = installPath + '/lib/codemirror/mode/markdown/markdown.js';
    script2.src = installPath + '/lib/codemirror/addon/merge/merge.js';

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
        origLeft: remoteNote,
        mode: 'markdown',
        lineNumbers: true,
        connect: 'align',
        value: curNote,
        lineWrapping: true
    });

    document.getElementById("titleLeft").value = remoteTitle;
    document.getElementById("titleRight").value = curTitle;

    log('CodeMirror Window loaded successfully.')
}


// A timeout to make sure CodeMirror is loaded.
setTimeout(initCodeMirror, 50, 100);