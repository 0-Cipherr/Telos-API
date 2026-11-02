export type ContractCheck = {
    ok: boolean;
    issues: string[];
};
/**
 * Compiles a user-submitted strategy with solc 0.8.24 and checks it against the
 * canonical IStrategy interface: it must compile, be concrete, and expose every
 * function IStrategy declares with the same signature.
 */
export declare function validateStrategyContract(source: string): ContractCheck;
//# sourceMappingURL=validateStrategyContract.d.ts.map