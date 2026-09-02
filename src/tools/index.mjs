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
export const tools = [salary, loan, parttime, savings, deposit, severance, leave, compound, vat];
