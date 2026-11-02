import { readFileSync } from "node:fs";
import { join } from "node:path";
import solc from "solc";
import { I_STRATEGY_SOURCE } from "./IStrategySource.js";
const STRATEGY_FILE = "Strategy.sol";
const INTERFACE_FILE = "IStrategy.sol";
function canonicalType(param) {
    if (param.type.startsWith("tuple")) {
        return `(${(param.components ?? []).map(canonicalType).join(",")})${param.type.slice("tuple".length)}`;
    }
    return param.type;
}
function functionSignatures(abi) {
    return new Set(abi
        .filter((item) => item.type === "function")
        .map((item) => `${item.name}(${(item.inputs ?? []).map(canonicalType).join(",")})`));
}
let cachedInterfaceAbi;
function interfaceAbi() {
    if (cachedInterfaceAbi)
        return cachedInterfaceAbi;
    const output = JSON.parse(solc.compile(JSON.stringify({
        language: "Solidity",
        sources: { [INTERFACE_FILE]: { content: I_STRATEGY_SOURCE } },
        settings: { outputSelection: { "*": { "*": ["abi"] } } },
    })));
    cachedInterfaceAbi = output.contracts?.[INTERFACE_FILE]?.IStrategy?.abi ?? [];
    return cachedInterfaceAbi;
}
// Only OpenZeppelin imports are resolved from disk. Anything else is rejected,
// so submitted source cannot read arbitrary files on the server.
function resolveImport(path) {
    if (path.startsWith("@openzeppelin/") && !path.includes("..")) {
        try {
            return { contents: readFileSync(join(process.cwd(), "node_modules", path), "utf8") };
        }
        catch {
            return { error: `OpenZeppelin file not found: ${path}` };
        }
    }
    return { error: `unsupported import "${path}"` };
}
/**
 * Compiles a user-submitted strategy with solc 0.8.24 and checks it against the
 * canonical IStrategy interface: it must compile, be concrete, and expose every
 * function IStrategy declares with the same signature.
 */
export function validateStrategyContract(source) {
    const issues = [];
    const contractName = /contract\s+([A-Za-z_]\w*)\s+is\s+[^{]*\bIStrategy\b/.exec(source)?.[1];
    if (!source.trim())
        return { ok: false, issues: ["contractCode is empty"] };
    if (!contractName)
        return { ok: false, issues: ["contractCode must declare `contract <Name> is IStrategy`"] };
    const input = {
        language: "Solidity",
        sources: {
            [STRATEGY_FILE]: { content: source },
            [INTERFACE_FILE]: { content: I_STRATEGY_SOURCE },
        },
        settings: {
            optimizer: { enabled: true, runs: 200 },
            outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
        },
    };
    const output = JSON.parse(solc.compile(JSON.stringify(input), {
        import: (path) => resolveImport(path),
    }));
    // A missing IStrategy function makes solc report the contract as abstract and
    // drop its ABI. In that case the missing members are named from the source.
    const errors = (output.errors ?? []).filter((error) => error.severity === "error");
    const abstractErrors = errors.filter((error) => error.formattedMessage.includes("should be marked as abstract"));
    for (const error of errors) {
        if (abstractErrors.includes(error))
            continue;
        if (issues.length < 8)
            issues.push(error.formattedMessage.split("\n")[0]);
    }
    if (issues.length > 0)
        return { ok: false, issues };
    const interfaceFunctions = functionSignatures(interfaceAbi());
    if (abstractErrors.length > 0) {
        for (const signature of interfaceFunctions) {
            const name = signature.slice(0, signature.indexOf("("));
            if (!new RegExp(`function\\s+${name}\\s*\\(`).test(source)) {
                issues.push(`missing IStrategy function: ${name}`);
            }
        }
        return { ok: false, issues: issues.length > 0 ? issues : [`${contractName} is abstract`] };
    }
    const strategy = output.contracts?.[STRATEGY_FILE]?.[contractName];
    if (!strategy)
        return { ok: false, issues: ["contract did not compile"] };
    if (!strategy.evm.bytecode.object)
        return { ok: false, issues: [`${contractName} did not produce bytecode`] };
    const implemented = functionSignatures(strategy.abi);
    for (const signature of interfaceFunctions) {
        if (!implemented.has(signature))
            issues.push(`missing or mismatched IStrategy function: ${signature}`);
    }
    return { ok: issues.length === 0, issues };
}
//# sourceMappingURL=validateStrategyContract.js.map