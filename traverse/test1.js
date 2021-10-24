const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;

const jscode = fs.readFileSync("./demo.js", {
    encoding: "utf-8"
});

let ast = parser.parse(jscode);

let visitor = {};
visitor.FunctionExpression = function (path) {
    console.log("4ra1n");
};
traverse(ast, visitor);

let code = generator(ast).code;
console.log(code);