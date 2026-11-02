export type ScheduledStrategyInput = {
    vaultId: number | null;
    name: string;
    description: string;
    protocol: string;
    chainId: number;
    entryPoint: string | null;
    exitPoint: string | null;
    apy: number;
    riskLevel: number | null;
    configuration: Record<string, unknown>;
    /** null = publish once at startAt. Otherwise publish every N days. */
    intervalDays: number | null;
    startAt: Date;
};
export declare function parseScheduledStrategy(body: unknown): {
    value?: ScheduledStrategyInput;
    error?: string;
};
export declare function createScheduledStrategy(input: ScheduledStrategyInput): Promise<any>;
export declare function listScheduledStrategies(): Promise<any[]>;
export declare function publishDueStrategies(): Promise<number>;
export declare function startScheduledStrategyPublisher(): void;
//# sourceMappingURL=scheduledStrategies.d.ts.map