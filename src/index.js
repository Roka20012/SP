// import checkSentStructure from "./chapter2";
import LexicalAnalysis from "./LexicalAnalysis";

let lexAnls = new LexicalAnalysis();
let inputElement = document.getElementById("input"),
    textareaElement = document.getElementById("textarea"),
    textareaElement2 = document.getElementById("textarea2"),
    textareaElement3 = document.getElementById("textarea3"),
    textareaElement4 = document.getElementById("textarea4");

const createFile = (text, name, type, id) => {
    let dlbtn = document.getElementById(`${id}`);
    let file = new Blob([text], { type: type });
    dlbtn.href = URL.createObjectURL(file);
    dlbtn.download = name;
};

const searchCommands = code => {
    //check comments in code
    for (let i = 0; i < code.length; i++) {
        if (~code[i].indexOf(";")) {
            code[i] = code[i].slice(0, code[i].indexOf(";"));
        }
    }

    code = code.map(el => el.match(/\.?(\w+|\W)/gi));
    for (let i = 0; i < code.length; i++) {
        if (code[i] === null) {
            code.splice(i, 1);
            i--;
        }
    }

    let details = [];

    code.forEach((el, i) => {
        details[i] = `Рядок: ${el.join("")}\n`;
        let j = 1;
        el.forEach(e => {
            let lexema =
                lexAnls.checkCommand(e) ||
                lexAnls.checkId(e) ||
                lexAnls.checkBinaryConst(e) ||
                lexAnls.checkDecimalConst(e) ||
                lexAnls.checkHexConst(e);

            if (!!lexema) {
                details[i] += `${j}. ${e} -> ${lexema}\n`;
                j++;
            }
        });
    });

    details = details.join("\n");
    textareaElement2.innerHTML = details;

    for (let i = 0; i < code.length; i++) {
        for (let j = 0; j < code[i].length; j++) {
            if (!code[i][j] || code[i][j].match(/\s+/gi)) {
                // console.log(code[i][j]);
                code[i].splice(j, 1);
                j--;
            }

            if (code[i][j] === ":" && !!code[i][j - 1]) {
                code[i][j - 1] = code[i][j - 1] + code[i][j];
                code[i].splice(j, 1);
                // console.log(code[i].toString());
            }
            // console.log(code[i]);
        }
    }
console.log(code);
    let {structureList} = lexAnls.getLabelMnem(code);
    let {listFile} = lexAnls.firstPass(code);
    let {errFile} = lexAnls.firstPass(code);

    textareaElement3.innerHTML = structureList;
    textareaElement4.innerHTML = listFile;
    createFile(details, "lexems.txt", "text/plain", "lex");
    createFile(structureList, "structure.txt", "text/plain", "struct");
    createFile(listFile, "firstPass.txt", "text/plain", "first");
    if(errFile) createFile(errFile, "errors.txt", "text/plain", "errors");
};

inputElement.onchange = event => {
    let asmFile = event.target.files[0];
    if (asmFile === undefined) return;

    if (asmFile.name.split(".")[1] === "asm" || asmFile.type === "text/plain") {
        let reader = new FileReader();

        reader.onloadend = event => {
            let text = event.target.result;
            textareaElement.value = text;
            let code = text.toString().split("\n");
            searchCommands(code);
        };

        reader.onerror = _ => alert("Помилка читання файлу!");
        reader.readAsText(asmFile);
    } else {
        alert("Це не текстовий файл!");
    }
};
