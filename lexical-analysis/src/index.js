import commands from "./tokens.json";

let inputElement = document.getElementById("input"),
    textareaElement = document.getElementById("textarea");
const checkConstants = (element, index) => {
    let aboutElement = "";

    if (element.match(/\d[a-h0-9]*h/gi)) {
        //16 constants
        aboutElement = `${index}. ${element} -> 16 константа\n`;
    }
    if (element.match(/^\d+$/)) {
        //10 constants
        aboutElement = `${index}. ${element} -> 10 константа\n`;
    }
    if (element.match(/[01]+b/gi)) {
        //2 constants
        aboutElement = `${index}. ${element} -> 2 константа\n`;
    }

    return aboutElement;
};

const checkId = (element, index) => {
    let aboutElement = "";

    if (element.match(/^([a-z?@$_&])([a-z?@$_&\d]*)$/gi)) {
        aboutElement = `${index}. ${element} ->  Ідентифікатор користувача або нe визначений\n`;
    }

    return aboutElement;
};

const createFile = (text, name, type) => {
    let dlbtn = document.getElementById("dlbtn");
    let file = new Blob([text], { type: type });
    dlbtn.href = URL.createObjectURL(file);
    dlbtn.download = name;
};

const searchCommands = (commands, code) => {
    code = code.map(el => el.match(/\.?(\w+|\W)/gi));
    if (code[code.length - 1] === null) {
        code.splice(code.length - 1, 1);
        code.push([""]);
    }

    let details = [];
    code.forEach((el, i) => {
        if (el.length > 1) details[i] = `Рядок: ${el.join("")}\n`;
        let j = 1;
        el.forEach(e => {
            if (commands[e.toUpperCase()]) {
                details[i] += `${j}. ${e} -> ${commands[e.toUpperCase()]}\n`;
                j++;
            } else if (checkId(e, j)) {
                details[i] += checkId(e, j);
                j++;
            } else if (checkConstants(e, j)) {
                details[i] += checkConstants(e, j);
                j++;
            }
        });
    });

    details = details.join("\n");
    console.log(details);
    console.log(code);
    createFile(details, "myfile.txt", "text/plain");
};

inputElement.onchange = event => {
    let asmFile = event.target.files[0];

    if (asmFile.type === "text/plain") {
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
