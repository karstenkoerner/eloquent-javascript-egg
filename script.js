



const program = "123 whatever";


function parseExpression(expression) {
    
    if (/^[0-9]$/.test(expression[0])) {
        let i = 0;

        while (i < expression.length && /^[0-9]$/.test(expression[i])) {
            i++;
        }

        const expr = {
                type: "value",
                value: Number(expression.slice(0, i))
        };
        const rest = expression.slice(i);

        return { expr, rest };
    } else if (expression[0] === '"') {
        let i = 1;

        while (i < expression.length && expression[i] !== '"') {
            i++;
        }

        if (i === expression.length) {
            throw new SyntaxError("Unterminated string literal");
        }

        const expr = {
            type: "value",
            value: expression.slice(1, i)
        }

        i++;

        const rest = expression.slice(i);

        return { expr, rest };
    }
}

parseExpression(program);