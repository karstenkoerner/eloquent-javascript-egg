




const program = "123 whatever";




function parseExpression(program) {
    let expr = {};
    let rest = "";
    
    // Numbers
    if (/^[0-9]$/.test(program[0])) {
        let i = 0;

        while (i < program.length && /^[0-9]$/.test(program[i])) {
            i++;
        }

        if (i === program.length || !/\w/.test(program[i])) {
            expr = {
                type: "value",
                value: Number(program.slice(0, i))
            };
            rest = program.slice(i);

            return parseApply(expr, rest);
        }
    }
    
    // Strings
    if (program[0] === '"') {
        let i = 1;

        while (i < program.length && program[i] !== '"') {
            i++;
        }

        if (i === program.length) {
            throw new SyntaxError("Unterminated string literal");
        }

        expr = {
            type: "value",
            value: program.slice(1, i)
        }

        i++;

        rest = program.slice(i);

        return parseApply(expr, rest);
    }

    // Words
    let i = 0;

    while (i < program.length && !/[\s(),#"]/.test(program[i])) {
        i++;
    }

    if (i === 0) {
        throw new SyntaxError("Unexpected syntax: " + program);
    }

    expr = {
        type: "word",
        name: program.slice(0, i)
    }

    rest = program.slice(i);

    console.log({expr: expr, rest: rest})
    return parseApply(expr, rest);
}


function parseApply(expr, rest) {
    const newRest = skipSpace(rest);
}


function skipSpace(string) {
    for (let i = 0; i < string.length; i++) {
        if (/\s/.test(string[i])) {
            continue;
        } else {
            return string.slice(i);
        }
    }

    return "";
}