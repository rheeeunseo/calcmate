import { calcSalary } from '../lib/salary.mjs';
import { num, wonKo } from '../lib/format.mjs';
import { $, val, setText, bind } from './_common.js';

function run() {
  const annual = val('annual');
  if (!annual) return;
  const r = calcSalary({ annual, nonTaxable: val('nonTaxable'), dependents: Math.max(1, val('dependents')), children: Math.max(0, val('children')) });
  setText('r-net', wonKo(r.monthlyNet));
  setText('r-annualNet', wonKo(r.annualNet));
  setText('r-rate', (r.deductionRate * 100).toFixed(1) + '%');
  setText('r-gross', num(r.monthlyGross) + '원');
  setText('r-pension', '-' + num(r.pension) + '원');
  setText('r-health', '-' + num(r.health) + '원');
  setText('r-ltc', '-' + num(r.longTermCare) + '원');
  setText('r-emp', '-' + num(r.employment) + '원');
  setText('r-tax', '-' + num(r.incomeTax) + '원');
  setText('r-local', '-' + num(r.localTax) + '원');
  setText('r-ded', '-' + num(r.totalDeduction) + '원');
}
bind(['annual', 'nonTaxable', 'dependents', 'children'], run);
