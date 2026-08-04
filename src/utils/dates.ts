/**
 * 掲載企業のsourcesから最新の確認日を導出する。
 * 市場データ側のcheckedDateを手動更新し忘れて古いまま表示され続ける事故を防ぐため、
 * 企業データ（sources[].checkedDate）を唯一の情報源として動的に算出する。
 */
import type { Company } from '../data/types.js';

export function getLatestCheckedDate(companies: Company[], fallback: string): string {
  const dates = companies
    .flatMap((c) => c.sources.map((s) => s.checkedDate))
    .filter((d): d is string => Boolean(d))
    .sort();
  return dates[dates.length - 1] ?? fallback;
}
