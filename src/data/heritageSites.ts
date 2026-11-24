import type { HeritageSite } from '../types/heritage.ts';
import { DEFAULT_HERITAGE_SITES as RAW_DEFAULT_HERITAGE_SITES } from './heritageData.ts';
import { getSiteReferences } from './heritageReferences.ts';

export const DEFAULT_HERITAGE_SITES: HeritageSite[] = RAW_DEFAULT_HERITAGE_SITES.map((site) => ({
  ...site,
  references: site.references && site.references.length > 0 ? site.references : getSiteReferences(site.id),
}));

export const HERITAGE_SITES: HeritageSite[] = DEFAULT_HERITAGE_SITES;
