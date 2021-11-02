# 流程平坦化

把原本的执行允许用switch-case取代

```javascript
var a = 1;
var b = 2;
var c = a + b;
```

处理后

```javascript
var arr = [1,0,2];
while(!![]){
    switch(arr[i++]){
        case 0:
            var b = 2;
            continue;
        case 1:
            var a = 1;
            continue;
        case 2:
            var c = a + b;
            continue;
    }
    break;
}
```