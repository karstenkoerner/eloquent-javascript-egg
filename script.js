

// TODO: Fix bug with numeric values which have word characters directly after them, for example "123abc". Currently it returns as a value rather than a word, but "123abc" should be considered a word, as it can be used as a variable name.

const program = "123 whatever";


function parseExpression(program) {
    
    if (/^[0-9]$/.test(program[0])) {
        let i = 0;

        while (i < program.length && /^[0-9]$/.test(program[i])) {
            i++;
        }

        const expr = {
                type: "value",
                value: Number(program.slice(0, i))
        };
        const rest = program.slice(i);

        return { expr, rest };
    } else if (program[0] === '"') {
        let i = 1;

        while (i < program.length && program[i] !== '"') {
            i++;
        }

        if (i === program.length) {
            throw new SyntaxError("Unterminated string literal");
        }

        const expr = {
            type: "value",
            value: program.slice(1, i)
        }

        i++;

        const rest = program.slice(i);

        return { expr, rest };
    } else {
        // Word handling more complicated because of variables and operators
    }
}

parseExpression(program);