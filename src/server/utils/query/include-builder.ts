// ============================================
// BASE TYPES
// ============================================

type FindManyConfigBase = {
  with?: unknown;
  columns?: unknown;
};

type ExtractFindManyConfig<T> = T extends { findMany: (config?: infer C) => unknown }
  ? C extends FindManyConfigBase
    ? C
    : never
  : never;

// ============================================
// GENERIC QUERY TYPES
// ============================================

export type WithConfigOf<TQuery> = NonNullable<ExtractFindManyConfig<TQuery>>['with'];
export type RelationKeysOf<TQuery> = keyof NonNullable<WithConfigOf<TQuery>>;

export type RelationConfigOf<TQuery, TRelation extends RelationKeysOf<TQuery>> = NonNullable<
  WithConfigOf<TQuery>
>[TRelation];

export type ColumnsConfigOf<TQuery> = NonNullable<ExtractFindManyConfig<TQuery>>['columns'];

// ============================================
// INCLUDE MAP HELPER
// ============================================

export type TypedIncludeMapping<TQuery, TRelation extends RelationKeysOf<TQuery>> = {
  relation: TRelation;
  config: RelationConfigOf<TQuery, TRelation>;
};

export function createIncludeMap<TQuery>() {
  return <
    TApiNames extends string,
    TMap extends {
      [K in TApiNames]: TypedIncludeMapping<TQuery, RelationKeysOf<TQuery>>;
    },
  >(
    map: TMap
  ): TMap => map;
}

// ============================================
// BUILD INCLUDES
// ============================================

export function buildTypedIncludes<
  TQuery,
  TApiNames extends string,
  TMap extends Record<TApiNames, { relation: RelationKeysOf<TQuery>; config: unknown }>,
>(includes: TApiNames[] | undefined, map: TMap): NonNullable<WithConfigOf<TQuery>> | undefined {
  if (!includes?.length) return undefined;

  const result: Record<string, unknown> = {};

  for (const key of includes) {
    const mapping = map[key];
    if (mapping) {
      result[mapping.relation as string] = mapping.config;
    }
  }

  return Object.keys(result).length > 0 ? (result as NonNullable<WithConfigOf<TQuery>>) : undefined;
}
