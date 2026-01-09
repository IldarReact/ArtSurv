/**
 * Turn Logic Modules
 *
 * Разбивка сложной функции processTurn на модульные Layer 3 функции
 * Каждый модуль отвечает за одну часть游戏 цикла
 *
 * ✅ Pure functions — no dependencies on store
 * ✅ Testable — each module can be tested independently
 * ✅ Composable — можно комбинировать в любом порядке
 */

export { processJobSkillProgression, type JobSkillProgressionResult } from './process-job-skills'
