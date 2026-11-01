/**
 * 掲載企業の並び順。
 * 並び順は「公式サイトで確認できた比較項目の数が多い順（同数は社名のよみ順）」で決める。
 * PR掲載の有無・報酬・提携の有無は一切使わない。
 */
import type { Company } from '../data/types.js';

const UNCONFIRMED = /^(公式サイトで確認できず|公開情報の範囲で記載|要問い合わせ)|記載なし/;

/** 比較項目のうち、公式サイトで内容を確認できた項目の数 */
export function countConfirmedItems(company: Company, comparisonItems: string[]): number {
  return comparisonItems.filter((item) => {
    const value = company.comparisonData[item];
    return typeof value === 'string' && value.length > 0 && !UNCONFIRMED.test(value);
  }).length;
}

export function sortByCompleteness(companies: Company[], comparisonItems: string[]): Company[] {
  return [...companies].sort((a, b) => {
    const diff = countConfirmedItems(b, comparisonItems) - countConfirmedItems(a, comparisonItems);
    if (diff !== 0) return diff;
    return (a.nameKana ?? a.name).localeCompare(b.nameKana ?? b.name, 'ja');
  });
}
