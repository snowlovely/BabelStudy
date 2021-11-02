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
        let blockStatementLength = blockStatement.body.length;
        if (blockStatementLength < 2) return;
        // 将函数内遍历声明提到参数中
        path.traverse({
            VariableDeclaration(p) {
                declarations = p.node.declarations;
                let statements = [];
                declarations.map(function (v) {
                    path.node.params.push(v.id);
                    // var a = 1;
                    // 将a提到函数参数然后替换为a = 1;
                    v.init && statements.push(t.assignmentExpression("=", v.id, v.init));
                });
                p.replaceInline(statements);
            }
        });
        let firstSta = blockStatement.body[0],
            i = 1;
        while (i < blockStatementLength) {
            let tempSta = blockStatement.body[i++];
            // 表达式情况下会多套一层
            t.isExpressionStatement(tempSta) ?
                secondSta = tempSta.expression : secondSta = tempSta;
            if (t.isReturnStatement(secondSta)) {
                // var a=1; return 0;
                // a=1; return 0;
                // return (a=1,0);
                firstSta = t.returnStatement(
                    t.toSequenceExpression([firstSta, secondSta.argument]));
            } else if (t.isAssignmentExpression(secondSta)) {
                if (t.isCallExpression(secondSta.right)) {
                    // a=1; b=str.replace();
                    // callee: str.replace();
                    let callee = secondSta.right.callee;
                    // callee.object before: b=str.replace();
                    // callee.object after: b=(a=1,str.replace());
                    callee.object = t.toSequenceExpression([firstSta, callee.object]);
                    firstSta = secondSta;
                } else {
                    // a=100; b=200;
                    // b=(a=100,200);
                    secondSta.right = t.toSequenceExpression([firstSta, secondSta.right]);
                    firstSta = secondSta;
                }
            } else {
                // a; b;
                // a,b;
                firstSta = t.toSequenceExpression([firstSta, secondSta]);
            }
        }
        path.get("body").replaceWith(t.blockStatement([firstSta]));
    }
});

let code = generator(ast).code;
fs.writeFile("./demo-new.js", code, (err) => { });
