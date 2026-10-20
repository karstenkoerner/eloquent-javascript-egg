const assert = require("node:assert/strict");
const test = require("node:test");
const { run } = require("../evaluator.js");


// ============================================================
// 1. LITERAL VALUES
// ============================================================

test("Evaluates numeric literals", () => {
    assert.equal(run("0"), 0);
    assert.equal(run("42"), 42);
});

test("Evaluates string literals", () => {
    assert.equal(run('"Hello world"'), "Hello world");
    assert.equal(run('""'), "");
});

test("Evaluates boolean values", () => {
    assert.equal(run("true"), true);
    assert.equal(run("false"), false);
});


// ============================================================
// 2. ARITHMETIC OPERATORS
// ============================================================

test("Evaluates addition", () => {
    assert.equal(run("+(3, 2)"), 5);
    assert.equal(run("+(0, 0)"), 0);
    assert.equal(run("+(7, 98)"), 105);
});

test("Evaluates subtraction", () => {
    assert.equal(run("-(3, 2)"), 1);
    assert.equal(run("-(2, 3)"), -1);
    assert.equal(run("-(5, 5)"), 0);
});

test("Evaluates multiplication", () => {
    assert.equal(run("*(3, 2)"), 6);
    assert.equal(run("*(4, 0)"), 0);
    assert.equal(run("*(7, 98)"), 686);
});

test("Evaluates division", () => {
    assert.equal(run("/(3, 2)"), 1.5);
    assert.equal(run("/(10, 2)"), 5);
    assert.equal(run("/(0, 5)"), 0);
});

test("Evaluates nested arithmetic expressions", () => {
    assert.equal(run("*(2, +(3, 4))"), 14);
    assert.equal(run("+(*(2, 3), *(4, 5))"), 26);
    assert.equal(run("*(+(2, 3), -(10, /(8, 2)))"), 30);
});

test("Evaluates deeply nested expressions", () => {
    assert.equal(
        run("+(1, *(2, -(10, /(8, +(1, 1)))))"),
        13
    );
});


// ============================================================
// 3. COMPARISON OPERATORS
// ============================================================

test("Evaluates equality comparisons", () => {
    assert.equal(run("==(5, 5)"), true);
    assert.equal(run("==(5, 6)"), false);
    assert.equal(run('==("hello", "hello")'), true);
    assert.equal(run('==("5", 5)'), false);
});

test("Evaluates greater-than comparisons", () => {
    assert.equal(run(">(10, 5)"), true);
    assert.equal(run(">(5, 10)"), false);
    assert.equal(run(">(5, 5)"), false);
});

test("Evaluates less-than comparisons", () => {
    assert.equal(run("<(5, 10)"), true);
    assert.equal(run("<(10, 5)"), false);
    assert.equal(run("<(5, 5)"), false);
});


// ============================================================
// 4. do() SPECIAL FORM
// ============================================================

test("Returns the last expression in do()", () => {
    assert.equal(run("do(1, 2, 3)"), 3);
    assert.equal(run("do(+(1, 2), *(3, 4))"), 12);
});

test("Returns false for an empty do()", () => {
    assert.equal(run("do()"), false);
});


// ============================================================
// 5. define() SPECIAL FORM
// ============================================================

test("Defines and retrieves variables", () => {
    assert.equal(run("do(define(x, 10), x)"), 10);
    assert.equal(run('do(define(message, "Hello"), message)'), "Hello");
});

test("Returns the assigned value from define()", () => {
    assert.equal(run("define(x, 42)"), 42);
});

test("Supports variable definitions using expressions", () => {
    assert.equal(
        run("do(define(x, +(5, 10)), *(x, 2))"),
        30
    );
});

test("Supports updating a variable in the same scope", () => {
    assert.equal(
        run("do(define(x, 5), define(x, +(x, 3)), x)"),
        8
    );
});

test("Creates an independent scope for each run()", () => {
    run("define(x, 100)");

    assert.throws(
        () => run("x"),
        ReferenceError
    );
});


// ============================================================
// 6. if() SPECIAL FORM
// ============================================================

test("Evaluates both conditional branches", () => {
    assert.equal(run("if(true, 10, 20)"), 10);
    assert.equal(run("if(false, 10, 20)"), 20);
});

test("Evaluates conditions containing comparisons", () => {
    assert.equal(run("if(>(10, 5), 1, 0)"), 1);
    assert.equal(run("if(<(10, 5), 1, 0)"), 0);
});

test("Treats only false as falsy", () => {
    assert.equal(run("if(0, 10, 20)"), 10);
    assert.equal(run('if("", 10, 20)'), 10);
});

test("Does not evaluate the unused conditional branch", () => {
    assert.equal(run("if(true, 10, unknownVariable)"), 10);
    assert.equal(run("if(false, unknownVariable, 20)"), 20);
});

test("Supports nested conditionals", () => {
    assert.equal(
        run("if(true, if(false, 1, 2), 3)"),
        2
    );
});


// ============================================================
// 7. while() SPECIAL FORM
// ============================================================

test("Executes a while loop until its condition is false", () => {
    const result = run(`
        do(
            define(counter, 0),

            while(<(counter, 5),
                define(counter, +(counter, 1))
            ),

            counter
        )
    `);

    assert.equal(result, 5);
});

test("Skips the loop body when the condition is false", () => {
    const result = run(`
        do(
            define(counter, 10),

            while(<(counter, 5),
                define(counter, 100)
            ),

            counter
        )
    `);

    assert.equal(result, 10);
});

test("Returns false when a while loop completes", () => {
    assert.equal(run("while(false, 100)"), false);
});

test("Supports nested loops", () => {
    const result = run(`
        do(
            define(outer, 0),
            define(total, 0),

            while(<(outer, 3),
                do(
                    define(inner, 0),

                    while(<(inner, 2),
                        do(
                            define(total, +(total, 1)),
                            define(inner, +(inner, 1))
                        )
                    ),

                    define(outer, +(outer, 1))
                )
            ),

            total
        )
    `);

    assert.equal(result, 6);
});


// ============================================================
// 8. fun() SPECIAL FORM
// ============================================================

test("Creates and invokes a user-defined function", () => {
    const result = run(`
        do(
            define(testFunction, fun(
                firstParam, secondParam, thirdParam,
                +(firstParam, +(secondParam, thirdParam))
            )),

            testFunction(6, 7, 9)
        )
    `);

    assert.equal(result, 22);
});

test("Supports functions without parameters", () => {
    assert.equal(
        run("do(define(getNumber, fun(42)), getNumber())"),
        42
    );
});

test("Supports immediate function invocation", () => {
    assert.equal(run("fun(x, *(x, 2))(10)"), 20);
});

test("Supports nested function calls", () => {
    const result = run(`
        do(
            define(double, fun(x, *(x, 2))),
            define(addFive, fun(x, +(x, 5))),

            double(addFive(10))
        )
    `);

    assert.equal(result, 30);
});

test("Supports passing functions as arguments", () => {
    const result = run(`
        do(
            define(applyTwice, fun(f, x,
                f(f(x))
            )),

            define(double, fun(n, *(n, 2))),

            applyTwice(double, 5)
        )
    `);

    assert.equal(result, 20);
});


// ============================================================
// 9. LEXICAL SCOPING AND CLOSURES
// ============================================================

test("Allows functions to access enclosing variables", () => {
    const result = run(`
        do(
            define(base, 10),

            define(addBase, fun(x,
                +(x, base)
            )),

            addBase(5)
        )
    `);

    assert.equal(result, 15);
});

test("Creates independent closures", () => {
    const result = run(`
        do(
            define(makeMultiplier, fun(factor,
                fun(number, *(number, factor))
            )),

            define(double, makeMultiplier(2)),
            define(triple, makeMultiplier(3)),

            +(double(10), triple(10))
        )
    `);

    assert.equal(result, 50);
});

test("Keeps function parameters local to their function", () => {
    assert.throws(() => run(`
        do(
            define(identity, fun(x, x)),
            identity(10),
            x
        )
    `), ReferenceError);
});

test("Supports parameter shadowing", () => {
    const result = run(`
        do(
            define(x, 100),
            define(identity, fun(x, x)),

            +(identity(5), x)
        )
    `);

    assert.equal(result, 105);
});


// ============================================================
// 10. RECURSION
// ============================================================

test("Evaluates recursive factorial functions", () => {
    const result = run(`
        do(
            define(factorial, fun(n,
                if(==(n, 0),
                    1,
                    *(n, factorial(-(n, 1)))
                )
            )),

            factorial(5)
        )
    `);

    assert.equal(result, 120);
});

test("Evaluates recursive Fibonacci functions", () => {
    const result = run(`
        do(
            define(fibonacci, fun(n,
                if(<(n, 2),
                    n,
                    +(
                        fibonacci(-(n, 1)),
                        fibonacci(-(n, 2))
                    )
                )
            )),

            fibonacci(7)
        )
    `);

    assert.equal(result, 13);
});


// ============================================================
// 11. print() BUILT-IN FUNCTION
// ============================================================

test("Returns the value passed to print()", () => {
    const originalLog = console.log;

    try {
        console.log = () => {};

        assert.equal(
            run('print("Hello world")'),
            "Hello world"
        );
    } finally {
        console.log = originalLog;
    }
});

test("Outputs the expected value to console", () => {
    const originalLog = console.log;
    const messages = [];

    try {
        console.log = (...args) => messages.push(args);

        const result = run(`
            do(
                define(message, "Hello world"),
                print(message)
            )
        `);

        assert.equal(result, "Hello world");
        assert.deepEqual(messages, [["Hello world"]]);
    } finally {
        console.log = originalLog;
    }
});


// ============================================================
// 12. ERROR HANDLING
// ============================================================

test("Rejects references to undefined variables", () => {
    assert.throws(() => run("unknownVariable"), ReferenceError);
});

test("Rejects attempts to call non-functions", () => {
    assert.throws(() => run("5(10)"), TypeError);
    assert.throws(() => run("true(10)"), TypeError);
});

test("Rejects invalid define() arguments", () => {
    assert.throws(() => run("define(10, 20)"), SyntaxError);
    assert.throws(() => run("define(x)"), SyntaxError);
    assert.throws(() => run("define(x, 1, 2)"), SyntaxError);
});

test("Rejects invalid if() argument counts", () => {
    assert.throws(() => run("if(true, 1)"), SyntaxError);
    assert.throws(() => run("if(true, 1, 2, 3)"), SyntaxError);
});

test("Rejects invalid while() argument counts", () => {
    assert.throws(() => run("while(true)"), SyntaxError);
    assert.throws(() => run("while(false, 1, 2)"), SyntaxError);
});

test("Rejects invalid function definitions", () => {
    assert.throws(() => run("fun()"), SyntaxError);
    assert.throws(() => run("fun(10, 20)"), SyntaxError);
});

test("Rejects incorrect function argument counts", () => {
    assert.throws(() => run(`
        do(
            define(add, fun(a, b, +(a, b))),
            add(10)
        )
    `), TypeError);

    assert.throws(() => run(`
        do(
            define(add, fun(a, b, +(a, b))),
            add(10, 20, 30)
        )
    `), TypeError);
});


// ============================================================
// 13. COMPLEX INTEGRATION TEST
// ============================================================

test("Executes a program combining multiple language features", () => {
    const result = run(`
        do(
            define(makeAdder, fun(amount,
                fun(number, +(number, amount))
            )),

            define(addFive, makeAdder(5)),
            define(counter, 0),
            define(total, 0),

            while(<(counter, 4),
                do(
                    define(total, +(total, addFive(counter))),
                    define(counter, +(counter, 1))
                )
            ),

            if(==(total, 26),
                "success",
                "failure"
            )
        )
    `);

    assert.equal(result, "success");
});
