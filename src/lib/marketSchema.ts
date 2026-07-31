/**
 * markets/{market-id}/ 配下のJSONスキーマ定義
 * docs/data-schema.md と対になる。npm run validate / seo-check / loadMarkets が参照する。
 */
import { z } from 'zod';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const dateString = z.string().regex(DATE_RE, 'YYYY-MM-DD形式で指定してください');

export const marketCategorySchema = z.enum(['equipment', 'office', 'hr-marketing', 'life']);

export const marketStatusSchema = z.enum(['research', 'strategy', 'building', 'qa', 'published']);

export const marketSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'idはkebab-caseで指定してください'),
  slug: z.string().optional(),
  name: z.string().min(1),
  shortName: z.string().optional(),
  category: marketCategorySchema,
  primaryArea: z.string().min(1),
  secondaryArea: z.string().optional(),
  primaryKeyword: z.string().min(1),
  businessModel: z.string().min(1),
  status: marketStatusSchema,
  h1: z.string().optional(),
  catchCopy: z.string().optional(),
  subCopy: z.string().optional(),
  description: z.string().optional(),
  targetUser: z.array(z.string()).optional(),
  conversionGoal: z.string().optional(),
  monetization: z.string().optional(),
  createdAt: dateString.optional(),
  updatedAt: dateString.optional(),
});

export type MarketJson = z.infer<typeof marketSchema>;

export const sourceTypeSchema = z.enum(['official', 'listing', 'review', 'other']);

export const sourceSchema = z.object({
  url: z.string().url(),
  type: sourceTypeSchema,
  checkedAt: dateString,
});

export type SourceJson = z.infer<typeof sourceSchema>;

export const companySchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'idはkebab-caseで指定してください'),
  name: z.string().min(1),
  officialUrl: z.string().url(),
  areas: z.array(z.string()).default([]),
  address: z.string().nullable().default(null),
  price: z
    .object({
      initial: z.number().nullable().default(null),
      monthly: z.number().nullable().default(null),
      successFee: z.number().nullable().default(null),
      note: z.string().nullable().default(null),
    })
    .default({ initial: null, monthly: null, successFee: null, note: null }),
  features: z.array(z.string()).default([]),
  freeConsultation: z.boolean().nullable().default(null),
  onlineAvailable: z.boolean().nullable().default(null),
  weekendAvailable: z.boolean().nullable().default(null),
  sources: z.array(sourceSchema).default([]),
});

export type CompanyJson = z.infer<typeof companySchema>;

export const companiesSchema = z.array(companySchema);

export const keywordsSchema = z.object({
  primaryKeyword: z.string().min(1),
  secondaryKeywords: z.array(z.string()).default([]),
  longTailKeywords: z.array(z.string()).default([]),
  questions: z.array(z.string()).default([]),
  searchIntents: z.array(z.string()).default([]),
  areas: z.array(z.string()).default([]),
});

export type KeywordsJson = z.infer<typeof keywordsSchema>;

const faqSchema = z.object({
  question: z.string().min(1),
  directAnswer: z.string().min(1),
  detail: z.string().min(1),
  conditions: z.string().optional(),
});

const slugSchema = z
  .string()
  .regex(/^\/([a-z0-9-]+\/)*$/, 'slugは "/" で始まり "/" で終わるパスにしてください（例: "/" "/price/" "/area/umeda/"）');

const pageBaseSchema = z.object({
  slug: slugSchema,
  targetKeyword: z.string().min(1),
  title: z.string().min(1).max(60, 'titleは60文字以内を推奨します'),
  description: z.string().max(160, 'descriptionは160文字以内を推奨します').default(''),
  h1: z.string().min(1),
  index: z.boolean().default(true),
  intro: z.string().optional(),
  faqs: z.array(faqSchema).default([]),
});

export const rankingPageSchema = pageBaseSchema.extend({
  type: z.literal('ranking'),
});

export const comparisonPageSchema = pageBaseSchema.extend({
  type: z.literal('comparison'),
  companyIds: z.array(z.string()).default([]),
});

export const areaPageSchema = pageBaseSchema.extend({
  type: z.literal('area'),
  areaName: z.string().min(1),
  companyIds: z.array(z.string()).default([]),
});

export const guidePageSchema = pageBaseSchema.extend({
  type: z.literal('guide'),
  sections: z
    .array(
      z.object({
        heading: z.string().min(1),
        body: z.string().min(1),
      })
    )
    .default([]),
});

export const pageSchema = z.discriminatedUnion('type', [
  rankingPageSchema,
  comparisonPageSchema,
  areaPageSchema,
  guidePageSchema,
]);

export type PageJson = z.infer<typeof pageSchema>;

export const pagesSchema = z.array(pageSchema);
