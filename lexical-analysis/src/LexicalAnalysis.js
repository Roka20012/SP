class LexicalAnalysis {
    checkConstants(element, index) {
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
    }

    checkId(element, index) {
        let aboutElement = "";

        if (element.match(/^([a-z?@$_&])([a-z?@$_&\d]*)$/gi)) {
            aboutElement = `${index}. ${element} ->  Ідентифікатор користувача або нe визначений\n`;
        }

        return aboutElement;
    }
}

export default LexicalAnalysis;
