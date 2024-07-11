
import type  { Enum, U8aFixed, Struct, BTreeSet, Bytes, u64 } from  "@polkadot/types-codec";
import type { ITuple } from "@polkadot/types-codec/types";
import { AccountId32 } from "@polkadot/types/interfaces";

interface PolymeshPrimitivesIdentityId extends U8aFixed {};

interface PolymeshPrimitivesTicker extends U8aFixed {};

interface IdentityId extends U8aFixed {};

interface PolymeshPrimitivesSubsetSubsetRestrictionTicker extends Enum {
  readonly isWhole: boolean;
  readonly isThese: boolean;
  readonly asThese: BTreeSet<PolymeshPrimitivesTicker>;
  readonly isExcept: boolean;
  readonly asExcept: BTreeSet<PolymeshPrimitivesTicker>;
  readonly type: 'Whole' | 'These' | 'Except';
};

interface PolymeshPrimitivesSubsetSubsetRestrictionDispatchableName extends Enum {
  readonly isWhole: boolean;
  readonly isThese: boolean;
  readonly asThese: BTreeSet<Bytes>;
  readonly isExcept: boolean;
  readonly asExcept: BTreeSet<Bytes>;
  readonly type: 'Whole' | 'These' | 'Except';
};

interface PolymeshPrimitivesSecondaryKeyPalletPermissions extends Struct {
  readonly palletName: Bytes;
  readonly dispatchableNames: PolymeshPrimitivesSubsetSubsetRestrictionDispatchableName;
};

interface PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions extends Enum {
  readonly isWhole: boolean;
  readonly isThese: boolean;
  readonly asThese: BTreeSet<PolymeshPrimitivesSecondaryKeyPalletPermissions>;
  readonly isExcept: boolean;
  readonly asExcept: BTreeSet<PolymeshPrimitivesSecondaryKeyPalletPermissions>;
  readonly type: 'Whole' | 'These' | 'Except';
};

interface PolymeshPrimitivesIdentityIdPortfolioKind extends Enum {
  readonly isDefault: boolean;
  readonly isUser: boolean;
  readonly asUser: u64;
  readonly type: 'Default' | 'User';
};

interface PolymeshPrimitivesIdentityIdPortfolioId extends Struct {
  readonly did: PolymeshPrimitivesIdentityId;
  readonly kind: PolymeshPrimitivesIdentityIdPortfolioKind;
};

interface PolymeshPrimitivesSubsetSubsetRestrictionPortfolioId extends Enum {
  readonly isWhole: boolean;
  readonly isThese: boolean;
  readonly asThese: BTreeSet<PolymeshPrimitivesIdentityIdPortfolioId>;
  readonly isExcept: boolean;
  readonly asExcept: BTreeSet<PolymeshPrimitivesIdentityIdPortfolioId>;
  readonly type: 'Whole' | 'These' | 'Except';
};

interface PolymeshPrimitivesSecondaryKeyPermissions extends Struct {
  readonly asset: PolymeshPrimitivesSubsetSubsetRestrictionTicker;
  readonly extrinsic: PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions;
  readonly portfolio: PolymeshPrimitivesSubsetSubsetRestrictionPortfolioId;
};

/** @name PolymeshPrimitivesSecondaryKeyKeyRecord (368) */
export interface PolymeshPrimitivesSecondaryKeyKeyRecord extends Enum {
  readonly isPrimaryKey: boolean;
  readonly asPrimaryKey: PolymeshPrimitivesIdentityId;
  readonly isSecondaryKey: boolean;
  readonly asSecondaryKey: ITuple<
    [PolymeshPrimitivesIdentityId, PolymeshPrimitivesSecondaryKeyPermissions]
  >;
  readonly isMultiSigSignerKey: boolean;
  readonly asMultiSigSignerKey: AccountId32;
  readonly type: 'PrimaryKey' | 'SecondaryKey' | 'MultiSigSignerKey';
};

export interface CddStatus extends Enum {
  readonly isOk: boolean;
  readonly asOk: IdentityId;
  readonly isErr: boolean;
  readonly asErr: Bytes;
  readonly type: 'Ok' | 'Err';
};

