




# The Egg Programming Language

An implementation of the Egg programming language from *Eloquent JavaScript*, built independently as a learning project.

## About

Egg is a toy programming language used to explore how programming languages are parsed and evaluated.

Based on the language specification in Eloquent JavaScript, this interpreter was independently implemented as an exercise in recursive-descent parsing, AST evaluation, and programming language design.

## Example Code

```javascript
do(
    define(makeMultiplier, fun(factor,
        fun(number,
            *(number, factor)
        )
    )),

    define(double, makeMultiplier(2)),
    define(triple, makeMultiplier(3)),

    print(double(10)),
    print(triple(10))
)
```



## Requirements / Blueprint

The program consists of two primary systems:

1. **Parser**
   - Accepts Egg source code as text.
   - Parses expressions and function applications.
   - Produces a structured representation of the program that can be processed by the interpreter.

2. **Evaluator**
   - Takes the structured representation produced by the parser.
   - Evaluates expressions according to the rules of the Egg language.
   - Handles Egg's built-in operations and language constructs.



## Testing

The project uses Node.js's built-in assertion library.



## Running an Egg Program

Requires Node.js.


Setup the CLI on your local machine:

```bash
git clone https://github.com/karstenkoerner/eloquent-javascript-egg.git
cd eloquent-javascript-egg
npm link
```

Run your file:

```bash
egg <filename>.egg
```