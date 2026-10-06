




# The Egg Programming Language

An implementation of the Egg programming language from *Eloquent JavaScript*, built independently as a learning project.

## About

Egg is a toy programming language used to explore how programming languages are parsed and evaluated.

This implementation is based on the requirements described in *Eloquent JavaScript*, but the implementation is written by me as an exercise in designing the parser and interpreter myself.



## Requirements / Blueprint

The program consists of two primary systems:

1. **Parser**
   - Accepts Egg source code as text.
   - Parses expressions and function applications.
   - Produces a structured representation of the program that can be processed by the interpreter.

2. **Interpreter**
   - Takes the structured representation produced by the parser.
   - Evaluates expressions according to the rules of the Egg language.
   - Handles Egg's built-in operations and language constructs.



## Running the Project

Requires Node.js.

```bash
node <filename>.js