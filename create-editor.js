/* global require, monaco, editor, deleteHandler, backspaceHandler, onDidChangeCursorSelection */

// create monaco editor
require.config({
    paths: {
        "vs": "../node_modules/monaco-editor/min/vs"
    }
});
require(["vs/editor/editor.main"], function () {
    var jsCode = [
        "\"use strict\";",
        "function Person(age) {",
        "    if (age) {",
        "        this.age = age;",
        "    }",
        "}",
        "// comment",
        "Person.prototype.getAge = function () {",
        "    return this.age;",
        "};"
    ].join("\n");

    // defines a custom theme with varied color text
    monaco.editor.defineTheme("normal", {
        base: "vs-dark", // can also be vs-dark or hc-black
        inherit: true, // can also be false to completely replace the builtin rules
        // set comment color
        rules: [
            { token: "comment.js", foreground: "ff0066", fontStyle: "bold" },
        ],
        // set editor background color
        colors: {
            //"editor.background": "#EDF9FA",
            "editor.lineHighlightBackground": "#800060",
        }
    });

    monaco.editor.defineTheme("flash", {
        base: "vs-dark", // can also be vs-dark or hc-black 
        inherit: true, // can also be false to completely replace the builtin rules 
        // set comment color 
        rules: [
            { token: "comment.js", foreground: "ff0066", fontStyle: "bold" },
        ],
        // set editor background color 
        colors: {
            "editor.background": "#262673",
            "editor.lineHighlightBackground": "#800060",
        }
    }); 

    // eslint-disable-next-line no-global-assign
    editor = monaco.editor.create(document.getElementById("container"), {
        value: jsCode,
        language: "typescript",
        theme: "normal"
    });

    editor.addCommand(monaco.KeyCode.Backspace, backspaceHandler);
    editor.addCommand(monaco.KeyCode.Delete, deleteHandler);
    editor.onDidChangeCursorSelection(onDidChangeCursorSelection);
});
