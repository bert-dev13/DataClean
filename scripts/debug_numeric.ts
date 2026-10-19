let val = ' 350.2 kwh ';
let str = String(val).replace(/\u00A0/g, ' ').trim().replace(/\s+/g, ' ');
console.log('after cleanWhitespace:', JSON.stringify(str));

str = str.replace(/(?:₱|\$|PHP|Php|php)\s*/g, '').replace(/,/g, '').trim();
console.log('after currency replace:', JSON.stringify(str));

const re = /\s*(cu\.m|m3|m\^3|kwh|meters|meter|m|pcs|pc|units|unit)$/i;
console.log('re test:', re.test(str));
str = str.replace(re, '').trim();
console.log('after unit replace:', JSON.stringify(str));

const num = Number(str);
console.log('num:', num, 'isNaN:', isNaN(num));
