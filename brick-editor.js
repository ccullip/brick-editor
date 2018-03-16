var editor;
var position;
var b = recast.types.builders;
var n = recast.types.namedTypes;

// initialize dictionary
var blockDict = [
    {
        'blockName': 'IF',
        'code': 'if (i == true) {\n\t// do something \n}',
        'buttonColor': '#ff3399', // fuschia
    },
    {
        'blockName': 'IF-ELSE',
        'code': 'if (i == true) {\n\t// do something \n} else {\n\t// do something \n}',
        'buttonColor': '#b8860b', // darkgoldenrod
    },
    {
        'blockName': 'FOR',
        'code': 'for (var i = 0; i < value; i++){\n\t // do something \n}',
        'buttonColor': '#00bfff', // deepskyblue
    },
    {
        'blockName': 'WHILE',
        'code': 'while (i < 10) {\n\t// do something \n}',
        'buttonColor': '#32cd32' // lime green
    },
    {
        'blockName': 'VARIABLE',
        'code': 'var variableName = value;',
        'buttonColor': '#9932cc' // darkorchid
    },
    {
        'blockName': 'FUNCTION',
        'code': 'function name(parameters) {\n\t // do something \n\t return value;\n}',
        'buttonColor': '#ff7f50' // coral
    },
];

/**
 * FIXME
 */
function load_quine() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200 && editor !== undefined) {
            editor.setValue(this.responseText);
        }
    };
    xhttp.open("GET", "brick-editor.js", true);
    xhttp.send();
}

/**
 * FIXME
 */
function start_brick_editor() {
    var jsCode = [
        '"use strict";',
        'function Person(age) {',
        '    if (age) {',
        '        this.age = age;',
        '    }',
        '}',
        '// comment',
        'Person.prototype.getAge = function () {',
        '    return this.age;',
        '};'
    ].join('\n');

    // defines a custom theme with varied color text
    monaco.editor.defineTheme('customTheme', {
        base: 'vs-dark', // can also be vs-dark or hc-black
        inherit: true, // can also be false to completely replace the builtin rules
        // set comment color
        rules: [
            { token: 'comment.js', foreground: 'ff0066', fontStyle: 'bold' },
        ],
        // set editor background color
        colors: {
            //'editor.background': '#EDF9FA',
            'editor.lineHighlightBackground': '#800060',
    }
    });

    editor = monaco.editor.create(document.getElementById("container"), {
        value: jsCode,
        language: "typescript",
        theme: "customTheme"
 
    });
    load_quine();

    editor.onMouseLeave(function (e) {
        position = editor.getPosition();
    });

    var decorations = editor.deltaDecorations([], []);
    // function isAtEndOfBlock?

    function isAtBlockBoundary(buffer, position, atStart) {
        
    }

    var backspaceCommand = editor.addCommand(monaco.KeyCode.Backspace, function (){
        var buffer = editor.getValue();
        position = editor.getPosition();
        
        var ast = recast.parse(buffer);
        
        var allowBackspace = true;
        estraverse.traverse(ast.program, {
            enter: function(node){
                if ((node.type == "IfStatement" || 
                    node.type == "ForStatement" || 
                    node.type == "FunctionDeclaration" || 
                    node.type == "WhileStatement" ||
                    node.type == "VariableDeclaration" ||
                    node.type == "ExpressionStatement") &&
                    position.lineNumber == node.loc.end.line && position.column - 1 == node.loc.end.column) {
                    allowBackspace = false;
                    decorations = editor.deltaDecorations([], [
                        { range: new monaco.Range(node.loc.start.line, node.loc.start.column, node.loc.end.line, node.loc.end.column), 
                        options: { isWholeLine: true, className: 'highlight'}}
                        ]);
                    setTimeout(function() {
                        var response = confirm("Are you sure you wish to delete?");
                        if (response){
                            // delete node
                            var beginPosition = { lineNumber: node.loc.start.line, column: node.loc.start.column};
                            var endPosition = {lineNumber: node.loc.end.line, column: node.loc.end.column + 1};
                            editor.setValue(deleteBlock(beginPosition, endPosition, position));
                        }
                    }, 100);  
                } 
            }
        })
        if (allowBackspace == true){
            editor.setValue(deleteChar(position));
            editor.setPosition(position);
        }
    });
}

/**
 * add a tab for every four spaces before cursor position for correct indenting
 */
function getIndent(position) {
    var tabs = "";
    for (var i = 0; i < position.column - 2; i = i + 4) {
        tabs += "\t";
    }
    return tabs;
}

/**
 * FIXME
 */
function indentCode(code, tabs) {
    var codeArray = code.split("\n");
    for (var i = 1; i < codeArray.length; i++) {
        codeArray[i] = tabs.concat(codeArray[i]);
    }
    return codeArray.join("\n");
}

/**
 * function to handle button clicks
 */
function buttonHandler(i) {
    var template = blockDict[i]["code"];
    var buffer = editor.getValue();
    var position = editor.getPosition();

    // add block to buffer string and update editor
    var new_text = addBlock(template, buffer, position);
    editor.setValue(recast.print(recast.parse(new_text)).code);
   
    // update cursor position
    editor.setPosition(position);
}

/**
 * adds a block based on word
 */
function addBlock(template, buffer, position) {
    var firstPart = getBeforePosition(buffer, position);
    var lastPart = getAfterPosition(buffer, position);
    var tabs = getIndent(position);

    return [firstPart, indentCode(template, tabs), lastPart].join("");
}

// delete a block
function deleteBlock(beginPosition, endPosition, position){
    var buffer = editor.getValue();
    var firstPart = getBeforePosition(buffer, beginPosition);
    var lastPart = getAfterPosition(buffer, endPosition);

    return [firstPart, lastPart].join('');
}

// delete a character
function deleteChar(position){
    var buffer = editor.getValue();
    var beginPosition = {lineNumber: position.lineNumber, column: position.column - 1}
    console.log(position.column - 1);
    var firstPart = getBeforePosition(buffer, beginPosition);
    var lastPart = getAfterPosition(buffer, position);
    return [firstPart, lastPart].join('');
}

// adds all the blocks to the button container
function addBlocksHTML() {
    for (var i = 0; i < blockDict.length; i++) {
        var HTMLfunction = 'buttonHandler(\'' + i + '\')';

        // creates button and sets all attributes
        var block = document.createElement("button");
        block.setAttribute("type", "button");
        block.setAttribute("class", "addBlockButton");
        block.appendChild(document.createTextNode(blockDict[i]['blockName']));
        block.setAttribute("style", "background-color:" + blockDict[i]['buttonColor']);
        block.setAttribute("onclick", HTMLfunction);

        // adds the new button inside the buttonContainer class at end
        var buttonContainer = document.getElementById("buttonContainer");
        buttonContainer.appendChild(block);

        // adds a break element to make a column of blocks
        buttonContainer.appendChild(document.createElement("br"));
    }
}

/**
 * returns a string containing characters before cursor position
 */
function getBeforePosition(buffer, position) {
    var splitBuffer = buffer.split("\n");
    var firstPart = splitBuffer.slice(0, position.lineNumber - 1);
    var sameLine = splitBuffer.slice(position.lineNumber - 1, position.lineNumber).join('');
    sameLine = sameLine.split('');
    if (position.column > 0){
        position.column = position.column - 1;
    }
    sameLine = sameLine.slice(0, position.column).join('');
    firstPart.push(sameLine);
    var firstPart1 = firstPart.join('\n');

    return firstPart1;
}

/*
 * returns a string containing characters after cursor position
 */
function getAfterPosition(buffer, position) {
    var splitBuffer = buffer.split("\n");                                                       // split string into array of lines
    var lastPart = splitBuffer.slice(position.lineNumber);                                      // select only the lines after the cursor
    var sameLine = splitBuffer.slice(position.lineNumber - 1, position.lineNumber).join('');    // select the cursors line
    sameLine = sameLine.split('');                                                              // select only the characters after the cursor in the line
    sameLine = sameLine.slice(position.column - 1).join('');
    lastPart.unshift(sameLine);                                                                 // add those characters to the beginning of the array
    var lastPart1 = lastPart.join('\n');                                                        // join all the array elements into a string

    return lastPart1;                                                                           // return the string
}
