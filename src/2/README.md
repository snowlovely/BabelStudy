# 变量加密与数组混淆

## 数字加密

a ^ b = c 则 a ^ c = b

如果b是原来的数字，那么改成a ^ c即可，而a的值可以随机生成

## 数组混淆

所有的字符串变量都可以提到全局数组，根据索引调用

## 数组乱序

将全局数组根据固定的算法打乱，再把对应的还原算法放入混淆后的JS