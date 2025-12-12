const { formatCurrency } = require('./src/lib/currency.ts');

console.log('Testing currency formatting:');
console.log('USD:', formatCurrency(1234.56, 'USD'));
console.log('EUR:', formatCurrency(1234.56, 'EUR'));
console.log('GBP:', formatCurrency(1234.56, 'GBP'));
console.log('MWK:', formatCurrency(1234.56, 'MWK'));