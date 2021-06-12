let myCodeMirror;

//window.onload(() => {
    myCodeMirror = CodeMirror.MergeView(document.getElementById('conflictRes-Editor'), {
        origLeft: 'test',
        mode: 'markdown',
        lineNumbers: true,
        connect: 'align',
        value: 'ahmed',
        allowEditingOriginals: true
    });
//});