const assert = require("node:assert/strict");
const { parse, parseExpression } = require("./parser.js");







function testParser(input, expectedAST, expectedRest = "") {

}




testParser(
    `do(
        define(makeMultiplier, fun(factor,
            fun(number,
                *(number, factor)
            )
        )),

        define(double, makeMultiplier(2)),
        define(triple, makeMultiplier(3)),

        print(double(10)),
        print(triple(10))
    )`,
    {
        // Root node
        type: "apply",
        operator: {
            type: "word",
            name: "do"
        },
        args: [
            // define(makeMultiplier, ...)
            // define(double, ...)
            // define(triple, ...)
            // print(double(10))
            // print(triple(10))
        ]
    }
);