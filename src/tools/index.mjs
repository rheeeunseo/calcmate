// 계산기 레지스트리 — 새 계산기는 여기에 추가하면 홈/사이트맵/관련도구에 자동 반영
import { tool as salary } from './salary.mjs';
import { tool as loan } from './loan.mjs';
import { tool as savings } from './savings.mjs';
import { tool as deposit } from './deposit.mjs';
import { tool as compound } from './compound.mjs';
import { tool as severance } from './severance.mjs';
import { tool as vat } from './vat.mjs';
import { tool as parttime } from './parttime.mjs';
import { tool as leave } from './leave.mjs';
import { tool as acquisition } from './acquisition.mjs';
import { tool as capitalgains } from './capitalgains.mjs';
import { tool as brokerage } from './brokerage.mjs';
import { tool as jeonse } from './jeonse.mjs';
import { tool as dsr } from './dsr.mjs';
import { tool as homecost } from './homecost.mjs';
export const tools = [salary, loan, parttime, savings, deposit, severance, leave, compound, vat, acquisition, capitalgains, brokerage, jeonse, dsr, homecost];
// 홈 화면 그룹
export const groups = [
  { title: '급여·세금', slugs: ['salary', 'parttime', 'leave', 'severance', 'vat'] },
  { title: '대출·저축', slugs: ['loan', 'dsr', 'savings', 'deposit', 'compound'] },
  { title: '부동산', slugs: ['home-cost', 'acquisition-tax', 'capital-gains-tax', 'brokerage', 'jeonse'] },
];
