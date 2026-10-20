// The evaluator recursively executes each expression according to its AST structure, using the current scope to resolve variables and functions, and returning the resulting value.
const { parse } = require("./parser.js");

/*

Built-in Egg functions:
+
-
*
/
==
<
>
print()


Built-in Egg values:
true
false


Built-in Egg special forms:
do()
define()
if()
while()
fun()

*/



function evaluate(expr, scope) {
    
    if (expr.type === "apply") {

        // do()
        if (expr.operator.type === "word" && expr.operator.name === "do") {
            let result = false;

            for (const arg of expr.args) {
                result = evaluate(arg, scope);
            }

            return result;
        }

        // define()
        if (expr.operator.type === "word" && expr.operator.name === "define") {

            if (expr.args.length === 2 && expr.args[0].type === "word") {
                const variableName = expr.args[0].name;
                const value = evaluate(expr.args[1], scope);

                scope[variableName] = value;

                return value;
            } else {
                throw new SyntaxError("Incorrect arguments in define()");
            }
        }

        // if()
        if (expr.operator.type === "word" && expr.operator.name === "if") {
            if (expr.args.length !== 3) {
                throw new SyntaxError("if() requires exactly 3 arguments");
            }

            const [ condition, thenExpression, elseExpression ] = expr.args;
            const result = evaluate(condition, scope);

            if (result !== false) {
                return evaluate(thenExpression, scope);
            } else {
                return evaluate(elseExpression, scope);
            }
        }

        // while()
        if (expr.operator.type === "word" && expr.operator.name === "while") {
            if (expr.args.length !== 2) {
                throw new SyntaxError("while() requires exactly 2 arguments");
            }

            const [ condition, expression ] = expr.args;
            let result = evaluate(condition, scope);

            while (result !== false) {
                evaluate(expression, scope);
                result = evaluate(condition, scope);
            }

            return false;
        }

        // fun()
        if (expr.operator.type === "word" && expr.operator.name === "fun") {
            if (expr.args.length < 1) {
                throw new SyntaxError("fun() expects at least 1 argument");
            }

            const parameters = expr.args.slice(0, -1);
            const body = expr.args[expr.args.length - 1];

            for (const parameter of parameters) {
                if (parameter.type !== "word") {
                    throw new SyntaxError("Function parameters must be variable names");
                }
            }

            return (...args) => {
                if (args.length !== parameters.length) {
                    throw new TypeError("Incorrect number of arguments");
                }

                const localScope = Object.create(scope);

                for (let i = 0; i < parameters.length; i++) {
                    localScope[parameters[i].name] = args[i];
                }

                return evaluate(body, localScope);
            };
        }

        const operator = evaluate(expr.operator, scope);

        if (typeof operator !== "function") {
            throw new TypeError(`${String(operator)} is not a function`);
        }

        const evaluatedArgs = [];

        for (const arg of expr.args) {
            evaluatedArgs.push(evaluate(arg, scope));
        }

        return operator(...evaluatedArgs);
    } else if (expr.type === "value") {
        return expr.value;
    } else if (expr.type === "word") {
        if (!(expr.name in scope)) {
            throw new ReferenceError(`Undefined variable: ${expr.name}`);
        }

        return scope[expr.name];
    } else {
        throw new Error(`Parser-Evaluator Contract Error: Unknown expression type: ${expr.type}`);
    }
}



const globalScope = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
    "==": (a, b) => a === b,
    ">": (a, b) => a > b,
    "<": (a, b) => a < b,
    "print": (message) => {
        console.log(message)
        return message;
    },
    "true": true,
    "false": false
};

function run(program) {
    return evaluate(parse(program), Object.create(globalScope));
}



module.exports = { run, evaluate };