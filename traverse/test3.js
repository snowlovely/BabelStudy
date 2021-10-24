const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;
const { exit } = require("process");

const jscode = fs.readFileSync("./demo.js", {
    encoding: "utf-8"
});

let ast = parser.parse(jscode);

const visitor1 = {
    "FunctionExpression|BinaryExpression"(path) {
        console.log("4ra1n");
    }
}

function func1(path) {
    console.log("func1");
}
function func2(path) {
    console.log("func2");
}
const visitor2 = {
    FunctionExpression: {
        enter: [func1, func2]
    }
}

// traverse(ast, visitor1);
traverse(ast, visitor2)

let code = generator(ast).code;
console.log(code);