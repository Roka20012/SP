import commands from "./tokens";
import menmocodes from "./mnemocodes";

class LexicalAnalysis {
    checkBinaryConst(el) {
        return el.match(/[01]+b/gi) ? "2 константа" : "";
    }

    checkDecimalConst(el) {
        return el.match(/^\d+$/) ? "10 константа" : "";
    }

    checkHexConst(el) {
        return el.match(/\d[a-h0-9]*h/gi) ? "16 константа" : "";
    }

    //indentificator and labels
    checkId(el) {
        return el.match(/^([a-z?@$_&])([a-z?@$_&\d]*:*)$/gi)
            ? "Індентифікатор користувача або невизначений"
            : "";
    }

    checkCommand(el) {
        if (arguments.length > 1) {
            return arguments[1][el.toUpperCase()]
                ? arguments[1][el.toUpperCase()]
                : "";
        }

        if (Array.isArray(commands[el.toUpperCase()])) {
            return commands[el.toUpperCase()][1];
        }

        return commands[el.toUpperCase()] ? commands[el.toUpperCase()] : "";
    }

    getLabelMnem(code) {
        let mnemoCodeList = {};
        let structureList = "";

        let label,
            mnemo,
            operand1,
            operand2,
            flag = 1;

        for (let i = 0; i < code.length; i++) {
            let line = code[i].join(" ");
            label = mnemo = operand1 = operand2 = undefined;
            flag = 1;

            for (let j = 0; j < code[i].length; j++) {
                let el = code[i][j];

                if (el[0] === ".") {
                    break;
                } else if (
                    !this.checkCommand(el) &&
                    this.checkId(el) &&
                    !label &&
                    flag
                ) {
                    label = el;
                } else if (this.checkCommand(el, menmocodes) && !mnemo) {
                    mnemo = el;
                    flag--;
                } else if (mnemo) {
                    if (~line.indexOf(",")) {
                        operand1 = line.slice(
                            line.indexOf(mnemo) + mnemo.length,
                            line.indexOf(",")
                        );
                        operand2 = line.slice(line.indexOf(",") + 1);
                    } else {
                        operand1 = line.slice(
                            line.indexOf(mnemo) + mnemo.length
                        );
                    }
                } else if (
                    !operand1 &&
                    !~line.indexOf(",") &&
                    code[i].length > 1
                ) {
                    operand1 = line.slice(line.indexOf(" ") + 1);
                    if (~line.indexOf(",")) {
                        operand2 = line.slice(line.indexOf(",") + 1);
                    }
                }
            }

            console.log(line);
            mnemoCodeList[i] = {
                line: line || "",
                label: label || "",
                mnemocode: mnemo || "",
                operand1: operand1 || "",
                operand2: operand2 || ""
            };

            structureList += `\nline: ${line}\nlabel: ${label}\nmnemocode: ${mnemo}\noperand1: ${operand1}\noperand2: ${operand2}\n\n`;
            console.log("line: ", line);
            console.log("label: ", label);
            console.log("menmocode: ", mnemo);
            console.log("operand1: ", operand1);
            console.log("operand2: ", operand2);
            console.log("\n\n");
        }
        console.log("menmList->", mnemoCodeList);
        return {mnemoCodeList, structureList};
    }

    checkBytes(bytes, el) {
        for (let key in bytes) {
            if (~bytes[key].indexOf(el)) return +key;
        }
        return 0;
    }

    firstPass(code) {
        let {mnemoCodeList} = this.getLabelMnem(code);
        let dataFlag = true;
        let bytes = {
            "0": [],
            "1": ["cli", "mov", "add", "and", "cmp", "imul", "div", "db", "or"],
            "2": ["dw"],
            "4": ["dd"],
            "5": []
        };
        let reg16 = "ax cx dx bx sp bp si di";
        let listFile = "";
        let errFile = "";
        let summ = 0;
        let varDw = "";
        let varAll = "";
        let declareLabels = {};

        for (let key in mnemoCodeList) {
            let line = mnemoCodeList[key]["line"];
            let lineInfo = mnemoCodeList[key];
            if(lineInfo["operand2"]) lineInfo["operand2"] = lineInfo["operand2"].split(" ").join("");

            if (
                ~lineInfo["label"].indexOf(":") &&
                !~lineInfo["label"].indexOf("beg")
            ) {
                if (
                    declareLabels[
                        lineInfo["label"]
                            .slice(0, -1)
                            .split(" ")
                            .join("")
                    ]
                ) {
                    errFile += "Error(too much declaration) line: " + ++key + "\n";
                } else {
                    declareLabels[
                        lineInfo["label"]
                            .slice(0, -1)
                            .split(" ")
                            .join("")
                    ] = key;
                }
            }

            if(lineInfo["line"].match(/^\s*(.model|.data|.code)\s*{?(tiny|small)?}?\s*$/gi)) {
                console.log("match line ->", lineInfo["line"]);
            } 

            if (line.split(" ").join("") === ".code") {
                summ = 0;
                listFile += "\n" + this.dec2hex(summ, line.split(" ").join(""));
            } else if (
                line.split(" ").join("") === ".data" ||
                ~lineInfo["label"].indexOf(":")
            ) {
                if (line.split(" ").join("") === ".data") {
                    summ = 0;
                    dataFlag
                        ? (dataFlag = !dataFlag)
                        : (errFile += "Error(two .data) line: " + ++key + "\n");
                    listFile += `\t\t\t\t  ` + line.split(" ").join("") + "\n";
                } else {
                    listFile += this.dec2hex(summ, line.split(" ").join(""));
                }
            } else if (
                line.split(" ").join("") === ".model{small}" ||
                line.split(" ").join("") === ".386"
            ) {
                listFile += "\t\t\t\t  " + line.split(" ").join("") + "\n";
            } else if (lineInfo["label"] || lineInfo["mnemocode"] === "cli") {
            

                if (lineInfo["mnemocode"]) {
                    if (lineInfo["label"] && lineInfo["mnemocode"] === "dw") {
                        varDw += lineInfo["label"] + " ";
                    }
                    if (lineInfo["label"]) {
                        varAll += lineInfo["label"] + " ";
                    }

                    listFile += this.dec2hex(summ, line);
                    summ += this.checkBytes(bytes, lineInfo["mnemocode"]);
                }
            } else if (lineInfo["mnemocode"] === "mov") {
                listFile += this.dec2hex(summ, line);
                
                if (!lineInfo["operand1"].split(" ").join("")) {
                    errFile += "Error(no operand1) line: " + ++key + "\n";
                } else if (!lineInfo["operand2"]) {
                    errFile += "Error(no operand2) line: " + ++key + "\n";
                }

                if (
                    ~lineInfo["operand1"].indexOf("[") &&
                    ~lineInfo["operand1"].indexOf("]") &&
                    ~lineInfo["operand1"].indexOf("dword ptr")
                ) {
                    summ += 7;
                } else if (
                    ~lineInfo["operand1"].indexOf("[") &&
                    ~lineInfo["operand1"].indexOf("]") &&
                    ~lineInfo["operand1"].indexOf("word ptr")
                ) {
                    summ += 6;
                } else if (
                    ~lineInfo["operand1"].indexOf("[") &&
                    ~lineInfo["operand1"].indexOf("]") &&
                    ~lineInfo["operand1"].indexOf("byte ptr")
                ) {
                    summ += 4;
                } else if (~varDw.indexOf(lineInfo["operand1"])) {
                    let operand2 = lineInfo["operand2"].split(" ").join("");
                    if (~operand2.indexOf("b") || ~operand2.indexOf("h")) {
                        operand2 = +operand2.slice(0, -1);
                        if (
                            parseInt(operand2, 2) < 0 ||
                            parseInt(operand2) > 128
                        ) {
                            summ += 4;
                        } else {
                            summ += 1;
                        }
                    }

                    summ += 7;
                } else if (~varAll.indexOf(lineInfo["operand1"])) {
                    let operand2 = lineInfo["operand2"].split(" ").join("");
                    if (~operand2.indexOf("b") || ~operand2.indexOf("h")) {
                        operand2 = +operand2.slice(0, -1);
                        if (
                            parseInt(operand2, 2) < 0 ||
                            parseInt(operand2) > 128
                        ) {
                            summ += 4;
                        } else {
                            summ += 1;
                        }
                    }

                    summ += 6;
                }
            } else if (lineInfo["mnemocode"] === "div") {
                listFile += this.dec2hex(summ, line);
                if (lineInfo["operand2"]) {
                    errFile += "Error(too much operands) line: " + ++key + "\n";
                } else if (
                    ~reg16.indexOf(lineInfo["operand1"].split(" ").join(""))
                ) {
                    summ += 3;
                } else {
                    summ += 2;
                }
            } else if (lineInfo["mnemocode"] === "imul") {
                listFile += this.dec2hex(summ, line);
                if (
                    ~lineInfo["operand1"].indexOf("[") &&
                    ~lineInfo["operand1"].indexOf("]") &&
                    ~lineInfo["operand1"].indexOf("word ptr")
                ) {
                    summ += 4;
                } else if (~varAll.indexOf(lineInfo["operand1"])) {
                    summ += 6;
                }
            } else if (lineInfo["mnemocode"] === "add") {
                listFile += this.dec2hex(summ, line);
                if (~reg16.indexOf(lineInfo["operand1"].split(" ").join(""))) {
                    summ += 3;
                } else {
                    summ += 2;
                }
            } else if (lineInfo["mnemocode"] === "and") {
                let flag16 = 0;
                if (~reg16.indexOf(lineInfo["operand1"].split(" ").join(""))) {
                    flag16 = 1;
                }

                listFile += this.dec2hex(summ, line);
                if (
                    flag16 &&
                    ~lineInfo["operand2"].indexOf("[") &&
                    ~lineInfo["operand2"].indexOf("]") &&
                    ~lineInfo["operand2"].indexOf("word ptr")
                ) {
                    summ += 5;
                } else if (
                    ~lineInfo["operand2"].indexOf("[") &&
                    ~lineInfo["operand2"].indexOf("]") &&
                    (~lineInfo["operand2"].indexOf("word ptr") || flag16)
                ) {
                    summ += 4;
                } else if (
                    ~lineInfo["operand2"].indexOf("[") &&
                    ~lineInfo["operand2"].indexOf("]")
                ) {
                    summ += 3;
                }
            } else if (lineInfo["mnemocode"] === "cmp") {
                let flag16 = 0;
                if (~reg16.indexOf(lineInfo["operand2"].split(" ").join(""))) {
                    flag16 = 1;
                }
                listFile += this.dec2hex(summ, line);
                if (
                    flag16 &&
                    ~lineInfo["operand1"].indexOf("[") &&
                    ~lineInfo["operand1"].indexOf("]") &&
                    ~lineInfo["operand1"].indexOf("word ptr")
                ) {
                    summ += 5;
                } else if (
                    ~lineInfo["operand1"].indexOf("[") &&
                    ~lineInfo["operand1"].indexOf("]") &&
                    (~lineInfo["operand1"].indexOf("word ptr") || flag16)
                ) {
                    summ += 4;
                } else if (
                    ~lineInfo["operand1"].indexOf("[") &&
                    ~lineInfo["operand1"].indexOf("]")
                ) {
                    summ += 3;
                } else if (~varDw.indexOf(lineInfo["operand1"]) && flag16) {
                    summ += 8;
                } else if (~varAll.indexOf(lineInfo["operand1"]) && flag16) {
                    summ += 7;
                } else if (~varAll.indexOf(lineInfo["operand1"])) {
                    summ += 6;
                }
            } else if (lineInfo["mnemocode"] === "or") {
                listFile += this.dec2hex(summ, line);

                if (~reg16.indexOf(lineInfo["operand1"].split(" ").join(""))) {
                    summ += 4;
                } else {
                    summ += 3;
                }
            } else if (
                lineInfo["mnemocode"] === "ja" ||
                lineInfo["mnemocode"] === "jmp"
            ) {
                listFile += this.dec2hex(summ, line);
                if (declareLabels[lineInfo["operand1"].split(" ").join("")]) {
                    summ += 2;
                } else {
                    lineInfo["mnemocode"] === "ja" ? (summ += 6) : (summ += 5);
                }
            } else if (lineInfo["mnemocode"] === "end") {
                listFile += this.dec2hex(summ, line);
            }
        }
        console.log("listFile\n", listFile);
        errFile ? console.log(errFile) : console.log("Compiled successfully");

        return {errFile, listFile};
    }

    dec2hex(i, line) {
        let result = "0000";
        if (i >= 0 && i <= 15) {
            result = "000" + i.toString(16).toUpperCase();
        } else if (i >= 16 && i <= 255) {
            result = "00" + i.toString(16).toUpperCase();
        } else if (i >= 256 && i <= 4095) {
            result = "0" + i.toString(16).toUpperCase();
        } else if (i >= 4096 && i <= 65535) {
            result = i.toString(16).toUpperCase();
        }
        return `${result}\t\t\t\t  ` + line + "\n";
    }
}

export default LexicalAnalysis;
