const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;

const jscode = fs.readFileSync("./demo.js", {
    encoding: "utf-8"
});

let ast = parser.parse(jscode);

traverse(ast, {
    // 不使用type的话
    // enter(path) {
    //     if (
    //         path.node.type === "Identifier" &&
    //         path.node.name === "a"
    //     ) {
    //         path.node.name = "x";
    //     }
    // }
    // 使用type
    // enter(path) {
    //     if (t.isIdentifier(path.node, { name: "a" })) {
    //         path.node.name = "x";
    //     }
    // }
    enter(path) {
        if (path.isIdentifier({ name: "a" })) {
            path.node.name = "x";
        }
    }
});

let code = generator(ast).code;
console.log(code);