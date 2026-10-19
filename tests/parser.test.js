const assert = require("node:assert/strict");
const { parse, parseExpression } = require("../parser.js");




// Verify that parse() returns the AST directly
assert.deepStrictEqual(
    parse("42"),
    { type: "value", value: 42 }
);

// Verify that parse() rejects unconsumed input
assert.throws(
    () => parse("42, remaining"),
    SyntaxError
);


function testParser(input, expectedAST, expectedRest = "") {
    const result = parseExpression(input);

    assert.deepStrictEqual(result.expr, expectedAST);
    assert.strictEqual(result.rest, expectedRest);
}



// Dummy program
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
        type: "apply",
        operator: {
            type: "word",
            name: "do"
        },
        args: [
            {
                type: "apply",
                operator: {
                    type: "word",
                    name: "define"
                },
                args: [
                    {
                        type: "word",
                        name: "makeMultiplier"
                    },
                    {
                        type: "apply",
                        operator: {
                            type: "word",
                            name: "fun"
                        },
                        args: [
                            {
                                type: "word",
                                name: "factor"
                            },
                            {
                                type: "apply",
                                operator: {
                                    type: "word",
                                    name: "fun"
                                },
                                args: [
                                    {
                                        type: "word",
                                        name: "number"
                                    },
                                    {
                                        type: "apply",
                                        operator: {
                                            type: "word",
                                            name: "*"
                                        },
                                        args: [
                                            {
                                                type: "word",
                                                name: "number"
                                            },
                                            {
                                                type: "word",
                                                name: "factor"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                type: "apply",
                operator: {
                    type: "word",
                    name: "define"
                },
                args: [
                    {
                        type: "word",
                        name: "double"
                    },
                    {
                        type: "apply",
                        operator: {
                            type: "word",
                            name: "makeMultiplier"
                        },
                        args: [
                            {
                                type: "value",
                                value: 2
                            }
                        ]
                    }
                ]
            },
            {
                type: "apply",
                operator: {
                    type: "word",
                    name: "define"
                },
                args: [
                    {
                        type: "word",
                        name: "triple"
                    },
                    {
                        type: "apply",
                        operator: {
                            type: "word",
                            name: "makeMultiplier"
                        },
                        args: [
                            {
                                type: "value",
                                value: 3
                            }
                        ]
                    }
                ]
            },
            {
                type: "apply",
                operator: {
                    type: "word",
                    name: "print"
                },
                args: [
                    {
                        type: "apply",
                        operator: {
                            type: "word",
                            name: "double"
                        },
                        args: [
                            {
                                type: "value",
                                value: 10
                            }
                        ]
                    }
                ]
            },
            {
                type: "apply",
                operator: {
                    type: "word",
                    name: "print"
                },
                args: [
                    {
                        type: "apply",
                        operator: {
                            type: "word",
                            name: "triple"
                        },
                        args: [
                            {
                                type: "value",
                                value: 10
                            }
                        ]
                    }
                ]
            }
        ]
    }
);

// Hello world
testParser(
    `"Hello, world!"`,
    { type: "value", value: "Hello, world!" }
);

// Hello world with weird punctuation
testParser(`"Hello (world)}).'/, again!"`, { type: "value", value: "Hello (world)}).'/, again!" });

// Print function without args
testParser(
    `print()`,
    {
        type: "apply",
        operator: { type: "word", name: "print" },
        args: []
    }
);

// An application where the operator is itself another application
testParser(
    `makeMultiplier(2)(10)`,
    {
        type: "apply",
        operator: {
            type: "apply",
            operator: { type: "word", name: "makeMultiplier" },
            args: [{ type: "value", value: 2 }]
        },
        args: [{ type: "value", value: 10 }]
    }
);

// Leading and trailing white space around a numeric literal
testParser(
    "   42   ",
    { type: "value", value: 42 }
);

// Numeric literal
testParser(
    `42`,
    { type: "value", value: 42 }
);

// Var name
testParser(
    `someVariable`,
    { type: "word", name: "someVariable" }
);

// Verify that unconsumed input is returned correctly
testParser(
    "42, remaining",
    { type: "value", value: 42 },
    ", remaining"
);








function testSyntaxError(input) {
    assert.throws(
        () => parse(input),
        SyntaxError,
        `Expected a SyntaxError for: ${JSON.stringify(input)}`
    );
}


// ------------------------------------------------------------
// 1. Empty or missing expressions
// ------------------------------------------------------------

// Completely empty program
testSyntaxError("");

// Whitespace-only program
testSyntaxError("   \n\t   ");

// Opening parenthesis without an operator
testSyntaxError("(42)");

// Unexpected closing parenthesis
testSyntaxError(")");

// Unexpected comma
testSyntaxError(",");

// Unexpected comma at the beginning of an expression
testSyntaxError(",42");


// ------------------------------------------------------------
// 2. Unclosed parentheses
// ------------------------------------------------------------

// Missing closing parenthesis
testSyntaxError("print(42");

// Nested application with missing closing parenthesis
testSyntaxError("print(add(1, 2)");

// Multiple unclosed parentheses
testSyntaxError("print(add(1, 2");

// Opening parenthesis without a closing parenthesis
testSyntaxError("print(");

// Nested opening parentheses without arguments
testSyntaxError("print(add(");


// ------------------------------------------------------------
// 3. Invalid argument separators
// ------------------------------------------------------------

// Missing comma between arguments
testSyntaxError("print(1 2)");

// Missing comma between nested applications
testSyntaxError("print(add(1, 2) add(3, 4))");

// Leading comma
testSyntaxError("print(,42)");

// Trailing comma
testSyntaxError("print(42,)");

// Consecutive commas
testSyntaxError("print(1,,2)");

// Multiple trailing commas
testSyntaxError("print(1,2,,)");


// ------------------------------------------------------------
// 4. Invalid string literals
// ------------------------------------------------------------

// Missing closing quotation mark
testSyntaxError('"Hello');

// Unterminated string inside an application
testSyntaxError('print("Hello)');

// Unterminated string inside a nested application
testSyntaxError('print(add("Hello, 42))');


// ------------------------------------------------------------
// 5. Unexpected text after a complete expression
// ------------------------------------------------------------

// Two numeric expressions without an enclosing application
testSyntaxError("42 43");

// Two words without an enclosing application
testSyntaxError("hello world");

// Valid application followed by another expression
testSyntaxError("print(42) print(43)");

// Extra closing parenthesis
testSyntaxError("print(42))");

// Extra closing parentheses after nested applications
testSyntaxError("print(add(1, 2)))");

// Unexpected comma after complete expression
testSyntaxError("42, remaining");

// Unexpected punctuation after complete expression
testSyntaxError("42)");


// ------------------------------------------------------------
// 6. Malformed nested expressions
// ------------------------------------------------------------

// Missing argument in nested application
testSyntaxError("print(add(1,))");

// Missing separator in nested application
testSyntaxError("print(add(1 2))");

// Missing closing parenthesis in deeper nesting
testSyntaxError("print(add(multiply(2, 3), 4)");

// Empty argument between separators in nested application
testSyntaxError("print(add(1,,2))");


// ------------------------------------------------------------
// 7. Valid expression followed by invalid syntax
// ------------------------------------------------------------

// Valid application followed by an unexpected comma
testSyntaxError("print(42),");

// Valid application followed by an unexpected opening parenthesis
// NOTE: This is actually VALID Egg syntax (chained application),
// so it must NOT be included as a syntax-error test.
// Example: print(42)(10)

// Valid numeric expression followed by an unexpected quote
testSyntaxError('42"hello"');

// Valid string expression followed by an unexpected word
testSyntaxError('"hello" world');


// ------------------------------------------------------------
// 8. Verify the parser recovers correctly from whitespace
// ------------------------------------------------------------

// Missing closing parenthesis despite trailing whitespace
testSyntaxError("print(42   ");

// Missing argument after comma with whitespace
testSyntaxError("print(42,   )");

// Missing argument after comma and newline
testSyntaxError("print(42,\n)");