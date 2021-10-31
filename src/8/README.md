# 逗号表达式

逗号会返回第二个值，将多行代码用逗号合并到一起做混淆

```javascript
var a=100; 
var b=200;
return b;

return b=(a=100,200);   
```