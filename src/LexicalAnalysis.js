import commands from './tokens';

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

    //indentificator
    checkId(el) {
        return el.match(/^([a-z?@$_&])([a-z?@$_&\d]*)$/gi) ? "Індентифікатор користувача або невизначений" : "";
    }

    checkCommand(el) {
        if(Array.isArray(commands[el.toUpperCase()])) {
            return commands[el.toUpperCase()][1];
        }
    
        return commands[el.toUpperCase()] ? commands[el.toUpperCase()] : "";
    }
}

export default LexicalAnalysis;
