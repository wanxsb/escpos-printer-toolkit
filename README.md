# escpos-printer-toolkit

A printer command toolkit for translate text to ESC/POS command. 

e.g.  Text "<C>这是一段打印测试文字</C>"

will be translate to esc/pos command with the text align center.

## Installation

```
npm install escpos-printer-toolkit --save
```

## Usage

```javascript
import EPToolkit from 'escpos-printer-toolkit';
let options = {
  beep: true, 
  cut: true, 
  tailingLine: true
}
EPToolkit.exchange_text("<C>这是一段打印测试文字</C>", options)

```


