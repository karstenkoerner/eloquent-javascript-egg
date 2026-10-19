// Parser currently does not support negative integers, decimals, escaped quotation marks, or comments.
// May or may not add those features at a later date.








function parseExpression(program) {
    program = skipSpace(program);
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

    return parseApply(expr, rest);
}


function parseApply(expr, rest) {
    const newRest = skipSpace(rest);
    
    if (newRest[0] === "(") {
        const applyNode = {
            type: "apply",
            operator: expr,
            args: []
        }

        let remaining = skipSpace(newRest.slice(1));

        while (remaining[0] !== ")") {
            if (remaining.length === 0) {
                throw new SyntaxError("Missing closing parenthesis");
            }

            const result = parseExpression(remaining);

            applyNode.args.push(result.expr);
            remaining = skipSpace(result.rest);

            if (remaining[0] === ",") {
                remaining = skipSpace(remaining.slice(1));

                if (remaining.length === 0 || remaining[0] === ")") {
                    throw new SyntaxError("Expected argument after comma");
                }
            } else if (remaining[0] !== ")") {
                throw new SyntaxError("Expected ',' or ')'");
            }
        }

        remaining = remaining.slice(1);
        return parseApply(applyNode, remaining);
    } else {
        return { expr, rest: newRest };
    }
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


function parse(program) {
    const result = parseExpression(program);

    if (result.rest.length > 0) {
        throw new SyntaxError(
            "Unexpected text after expression: " + result.rest
        );
    }

    return result.expr;
}

module.exports = { parse, parseExpression };