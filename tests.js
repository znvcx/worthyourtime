import { formatTemps, validateNumber } from './utils.js';

function runTests() {
  console.log('Exécution des tests...');

  // Test formatTemps
  console.assert(formatTemps(2.5, 8) === '2h 30m', 'formatTemps test 1 failed');
  console.assert(formatTemps(26, 8) === '3j 2h', 'formatTemps test 2 failed');

  // Test validateNumber
  console.assert(validateNumber('10', 0, 100) === 10, 'validateNumber test 1 failed');
  console.assert(validateNumber('-5', 0, 100) === 0, 'validateNumber test 2 failed');
  console.assert(validateNumber('150', 0, 100) === 100, 'validateNumber test 3 failed');

  console.log('Tous les tests ont passé !');
}

runTests();