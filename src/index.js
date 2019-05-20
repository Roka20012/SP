import commands from "./tokens";
import checkSentStructure from "./chapter2";
import LexicalAnalysis from "./LexicalAnalysis";

let lexAnls = new LexicalAnalysis();
let inputElement = document.getElementById("input"),
    textareaElement = document.getElementById("textarea"),
    textareaElement2 = document.getElementById("textarea2");

const createFile = (text, name, type) => {
    let dlbtn = document.getElementById("dlbtn");
    let file = new Blob([text], { type: type });
    dlbtn.href = URL.createObjectURL(file);
    dlbtn.download = name;
};

const searchCommands = (commands, code) => {
    code = code.map(el => el.match(/\.?(\w+|\W)/gi));
    for (let i = 0; i < code.length; i++) {
        if (code[i] === null) {
            code.splice(i, 1);
            i--;
        }
    }

    if (code[code.length - 1] === null) {
        code.splice(code.length - 1, 1);
        code.push([""]);
    }

    let details = [];
    console.log(code);
    code.forEach((el, i) => {
        details[i] = `Рядок: ${el.join("")}\n`;
        let j = 1;
        el.forEach(e => {
            if (commands[e.toUpperCase()]) {
                details[i] += `${j}. ${e} -> ${commands[e.toUpperCase()]}\n`;
                j++;
            } else if (lexAnls.checkId(e, j)) {
                details[i] += lexAnls.checkId(e, j);
                j++;
            } else if (lexAnls.checkConstants(e, j)) {
                details[i] += lexAnls.checkConstants(e, j);
                j++;
            }
        });
    });

    details = details.join("\n");
    textareaElement2.innerHTML = details;
    console.log("details");
    console.log(details);
    console.log("code");
    console.log(code);

    for (let i = 0; i < code.length; i++) {
        for (let j = 0; j < code[i].length; j++) {
            if (!code[i][j] || code[i][j].match(/\s+/gi)) {
                console.log(code[i][j]);
                code[i].splice(j, 1);
                j--;
            }
        }
    }

    console.log(code);

    createFile(details, "myfile.txt", "text/plain");
};

inputElement.onchange = event => {
    let asmFile = event.target.files[0];
    // console.log(asmFile.name.split(".")[1]);
    if (asmFile === undefined) return;

    if (asmFile.name.split(".")[1] === "asm" || asmFile.type === "text/plain") {
        let reader = new FileReader();

        reader.onloadend = event => {
            let text = event.target.result;
            textareaElement.value = text;
            let code = text.toString().split("\n");
            searchCommands(commands, code);
        };

        reader.onerror = _ => alert("Помилка читання файлу!");
        reader.readAsText(asmFile);
    } else {
        alert("Це не текстовий файл!");
    }
};
