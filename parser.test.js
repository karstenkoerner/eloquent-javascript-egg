const assert = require("node:assert/strict");
const { parseExpression } = require("./parser.js");




// Test the expected AST and remaining input.
function testParser(input, expectedAST, expectedRest = "") {
    const result = parseExpression(input);

    assert.deepStrictEqual(result.expr, expectedAST);
    assert.equal(result.rest, expectedRest);

    console.log(`PASS: ${input}`);
}

// Test whether invalid input throws a SyntaxError.
function testSyntaxError(input) {
    assert.throws(
        () => parseExpression(input),
        SyntaxError
    );

    console.log(`PASS (SyntaxError): ${input}`);
}

// Basic expressions
testParser("42", {
    type: "value",
    value: 42
});

testParser("hello", {
    type: "word",
    name: "hello"
});

// Simple application
testParser("+(1, 2)", {
    type: "apply",
    operator: { type: "word", name: "+" },
    args: [
        { type: "value", value: 1 },
        { type: "value", value: 2 }
    ]
});

// Nested application
testParser("+(1, *(2, 3))", {
    type: "apply",
    operator: { type: "word", name: "+" },
    args: [
        { type: "value", value: 1 },
        {
            type: "apply",
            operator: { type: "word", name: "*" },
            args: [
                { type: "value", value: 2 },
                { type: "value", value: 3 }
            ]
        }
    ]
});

// Leftover input is expected at this stage.
testParser("42)", {
    type: "value",
    value: 42
}, ")");

testParser("+(1, 2))", {
    type: "apply",
    operator: { type: "word", name: "+" },
    args: [
        { type: "value", value: 1 },
        { type: "value", value: 2 }
    ]
}, ")");

// Invalid applications
testSyntaxError("f(1,)");
testSyntaxError("f(1 2)");
testSyntaxError("f(1, 2");