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
    FunctionExpression: function (path) {
        console.log("4ra1n");
    }
}

// 常用
const visitor2 = {
    FunctionExpression(path) {
        // 进入节点时操作可以省略
        console.log("4ra1n");
    }
}

const visitor3 = {
    FunctionExpression: {
        // 进入节点时操作
        enter(path) {
            console.log("4ra1n enter");
        }
    }
}

const visitor4 = {
    FunctionExpression: {
        enter(path) {
            console.log("4ra1n enter");
        },
        exit(path) {
            console.log("4ra1n exit")
        }
    }
}

// traverse(ast, visitor1)
// traverse(ast, visitor2);
// traverse(ast, visitor3);
traverse(ast, visitor4);

let code = generator(ast).code;
console.log(code);