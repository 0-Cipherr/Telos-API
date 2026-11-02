import pool from "../db/pool.js";
export class BridgeQueries {
    async saveQuotes(quotes) {
        for (const quote of quotes) {
            await pool.query(`INSERT INTO BridgeQuotes
           (provider, quote_id, origin_chain, destination_chain, sell_token, buy_token,
            sell_amount, buy_amount, transaction, allowance_spender)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (quote_id) DO NOTHING`, [
                quote.provider,
                quote.quoteId,
                quote.originChain,
                quote.destinationChain,
                quote.sellToken.toLowerCase(),
                quote.buyToken.toLowerCase(),
                quote.sellAmount,
                quote.buyAmount,
                JSON.stringify(quote.transaction),
                quote.allowanceSpender?.toLowerCase() ?? null,
            ]);
        }
    }
    async getQuoteById(quoteId) {
        const { rows } = await pool.query("SELECT * FROM BridgeQuotes WHERE quote_id = $1", [quoteId]);
        const row = rows[0];
        if (!row)
            return null;
        return {
            provider: row.provider,
            quoteId: row.quote_id,
            originChain: row.origin_chain,
            destinationChain: row.destination_chain,
            sellToken: row.sell_token,
            buyToken: row.buy_token,
            sellAmount: row.sell_amount,
            buyAmount: row.buy_amount,
            transaction: row.transaction,
            allowanceSpender: row.allowance_spender,
        };
    }
    async upsertTransfer(input) {
        const { rows } = await pool.query(`INSERT INTO BridgeTransfers (provider, quote_id, origin_chain, origin_tx_hash, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (origin_tx_hash) DO UPDATE
         SET status = EXCLUDED.status, updated_at = NOW()
       RETURNING *`, [input.provider, input.quoteId, input.originChain, input.originTxHash.toLowerCase(), input.status]);
        return rows[0];
    }
    async getTransferByTxHash(originTxHash) {
        const { rows } = await pool.query("SELECT * FROM BridgeTransfers WHERE origin_tx_hash = $1", [originTxHash.toLowerCase()]);
        return rows[0] ?? null;
    }
}
export default BridgeQueries;
//# sourceMappingURL=BridgeQueries.js.map