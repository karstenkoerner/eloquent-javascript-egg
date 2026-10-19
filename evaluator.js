// The evaluator recursively executes each expression according to its AST structure, using the current scope to resolve variables and functions, and returning the resulting value.
const { parse } = require("./parser.js");







function evaluate(expr, scope) {
    const evaluatedArgs = [];

    if (!scope) {
        scope = {
            "+": (a, b) => a + b,
            "*": (a, b) => a * b,
            "-": (a, b) => a - b
        };
    }
    
    if (expr.type === "apply") {
        let i = 0;

        if (expr.operator.type === "word" && expr.operator.name === "define") {
            const variableName = expr.args[0].name;
            const value = evaluate(expr.args[1], scope);

            scope[variableName] = value;

            return value;
        }

        if (expr.operator.type === "word" && expr.operator.name === "do") {
            // Evaluate each argument
            // Then return the result of the last argument to be evaluated.
            // Technically it isn't required to return the last result, but it's an arbitrary Egg design choice so I am following it.
            let result = false;

            for (const arg of expr.args) {
                result = evaluate(arg, scope);
            }

            return result;
        }

        while (i < expr.args.length) {
            evaluatedArgs.push(evaluate(expr.args[i], scope));
            i++;
        }

        const operator = evaluate(expr.operator, scope);

        return operator(...evaluatedArgs);
    } else if (expr.type === "value") {
        return expr.value;
    } else if (expr.type === "word") {
        return scope[expr.name];
    }
}








let scope = {
    "+": (a, b) => a + b,
    "*": (a, b) => a * b,
    "-": (a, b) => a - b
};

// Source code equivalent to expr: +(5, x), where x was defined previously as 10 for testing purposes.
console.log(evaluate({ type: "apply", operator: { name: "+", type: "word"}, args: [{ type: "value", value: 5 }, { type: "word", name: "x" }] }, { ...scope, x: 10 }));



// Nested program, source code: +(5, *(6, 7))
console.log(evaluate(parse(`
        do(
            define(x, 10),
            define(y, +(x, 5)),
            *(x, y)
        )
`)));


module.exports = { evaluate };