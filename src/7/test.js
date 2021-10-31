const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;
const fs = require("fs");

const jscode = fs.readFileSync("../demo.js", {
    encoding: "utf-8"
});
let ast = parser.parse(jscode);

traverse(ast, {
    FunctionExpression(path) {
        let blockStatement = path.node.body;
        // 保存原来的顺序
        let Statements = blockStatement.body.map(function (v, i) {
            return { index: i, value: v };
        });
        // 简单打乱顺序函数
        let i = Statements.length;
        while (i) {
            let j = Math.floor(Math.random() * i--);
            [Statements[j], Statements[i]] = [Statements[i], Statements[j]];
        }
        // 分发器
        let dispenserArr = [];
        // case数组
        let cases = [];
        // 此时Statements是乱序
        Statements.map(function (v, i) {
            // 原来的顺序->打乱后的索引
            dispenserArr[v.index] = i;
            // case i: [原来的语句]; continue;
            let switchCase = t.switchCase(t.numericLiteral(i), [v.value, t.continueStatement()]);
            cases.push(switchCase);
        });
        let dispenserStr = dispenserArr.join("|");
        let array = path.scope.generateUidIdentifier("array");
        let index = path.scope.generateUidIdentifier("index");
        let callee = t.memberExpression(t.stringLiteral(dispenserStr), t.identifier("split"));
        // str.split("|")
        let arrayInit = t.callExpression(callee, [t.stringLiteral("|")]);
        let varArray = t.variableDeclarator(array, arrayInit);
        let varIndex = t.variableDeclarator(index, t.numericLiteral(0));
        // let array=str.split("|"),index = 0;
        let dispenser = t.variableDeclaration("let", [varArray, varIndex]);
        let updExp = t.updateExpression("++", index);
        // array[index++]
        let memExp = t.memberExpression(array, updExp, true);
        let discriminant = t.unaryExpression("+", memExp);
        // switch(+array[index++])
        // 这个+好只是一个简单的str转int
        let switchSta = t.switchStatement(discriminant, cases);
        let unaExp = t.unaryExpression("!", t.arrayExpression());
        unaExp = t.unaryExpression("!", unaExp);
        // while(!![]){switch(+array[index++]){cases;break;}}
        let whileSta = t.whileStatement(unaExp, t.blockStatement([switchSta, t.breakStatement()]));
        path.get("body").replaceWith(t.blockStatement([dispenser, whileSta]));
    }
});

let code = generator(ast).code;
fs.writeFile("./demo-new.js", code, (err) => { });
