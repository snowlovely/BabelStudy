const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;
const fs = require("fs");

const jscode = fs.readFileSync("./demo.js", {
        encoding: "utf-8"
    });
let ast = parser.parse(jscode);

traverse(ast, {
	FunctionExpression(path){
		let blockStatement = path.node.body;
		let Statements = blockStatement.body.map(function(v){
			if(t.isReturnStatement(v)) return v;
			if(!(v.trailingComments && v.trailingComments[0].value == "ASCIIEncrypt")) return v;
			delete v.trailingComments;
			let code = generator(v).code;
			// 将代码字符串转为简单数字表达式数组
			let codeAscii = [].map.call(code, function(v){
				return t.numericLiteral(v.charCodeAt(0));
			});
			// String.fromCharCode();
			let decryptFuncName = t.memberExpression(t.identifier("String"), t.identifier("fromCharCode"));
			// String.fromCharCode(ASCII Array);
			let decryptFunc = t.callExpression(decryptFuncName, codeAscii);
			// eval(String.fromCharCode(ASCII Array));
			return t.expressionStatement(t.callExpression(t.identifier("eval"), [decryptFunc]));
		});
		path.get("body").replaceWith(t.blockStatement(Statements));
	}
});

traverse(ast, {
    enter(path) {
        t.removeComments(path.node);
    }
});

let code = generator(ast).code;
fs.writeFile("./demo-new.js", code, (err)=>{});
