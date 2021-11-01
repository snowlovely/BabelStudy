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
	// 所有二项式
	BinaryExpression(path) {
		// 比如+-<>
		let operator = path.node.operator;
		let left = path.node.left;
		let right = path.node.right;
		// 新函数的参数固定是a和b
		let a = t.identifier("a");
		let b = t.identifier("b");
		// 以xxx开头生成唯一标识符名
		let funcNameIdentifier = path.scope.generateUidIdentifier("xxx");
		// 造一个格式为xxx(a,b){return a[op]b}的函数
		let func = t.functionDeclaration(
			funcNameIdentifier,
			[a, b],
			t.blockStatement([t.returnStatement(
				t.binaryExpression(operator, a, b)
			)]));
		// 生成的函数应该在path同级下
		// BlockStatement是具体的函数体
		let BlockStatement = path.findParent(
			function (p) { return p.isBlockStatement() });
		// 头插新函数
		BlockStatement.node.body.unshift(func);
		// 将二项式整体换为一个函数调用表达式
		path.replaceWith(t.callExpression(funcNameIdentifier, [left, right]));
	}
});

let code = generator(ast).code;
fs.writeFile("./demo-new.js", code, (err) => { });
