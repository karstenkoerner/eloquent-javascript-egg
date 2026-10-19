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

//TODO: Implement the rest of the built-in special forms.
//TODO: Write tests for the evaluator.



function evaluate(expr, scope) {
    
    if (expr.type === "apply") {

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

        if (expr.operator.type === "word" && expr.operator.name === "do") {
            let result = false;

            for (const arg of expr.args) {
                result = evaluate(arg, scope);
            }

            return result;
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






// Nested program
console.log(run(`
        do(
            define(x, 10),
            define(y, +(x, 5)),
            *(x, y)
        )
`));


module.exports = { evaluate };