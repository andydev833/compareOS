/**
 * クリック計測共通関数
 * 初稿はconsole.log出力。後からGA4等に接続可能な設計。
 */

import type { TrackingParams } from '../data/types.js';

/**
 * 外部リンクのクリックを計測する
 * 初稿実装: コンソールへ出力
 * 本番実装: GA4 gtag() / 独自APIへ接続
 */
export function trackOutboundClick(params: TrackingParams): void {
  const event = {
    event: 'outbound_click',
    ...params,
    timestamp: new Date().toISOString(),
    referrer: typeof window !== 'undefined' ? document.referrer : '',
  };

  // 初稿: コンソール出力
  console.log('[Oppick] trackOutboundClick:', event);

  // GA4連携（後から有効化）
  // if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
  //   (window as any).gtag('event', 'outbound_click', {
  //     market_id: params.marketId,
  //     company_id: params.companyId,
  //     page_type: params.pageType,
  //     placement: params.placement,
  //     listing_type: params.listingType,
  //   });
  // }
}

/**
 * 外部リンクのクリックハンドラーを生成する
 */
export function createOutboundClickHandler(params: TrackingParams) {
  return (event: MouseEvent) => {
    trackOutboundClick(params);
    // デフォルトの動作（リンク遷移）は継続
  };
}
