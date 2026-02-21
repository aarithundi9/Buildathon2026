/**
 * Cost computation utilities.
 * Matches the backend cost rates exactly.
 */

export const COST_RATES: Record<string, { prompt: number; completion: number }> = {
  "gpt-4": { prompt: 0.03, completion: 0.06 },
  "claude-3.5": { prompt: 0.003, completion: 0.015 },
  default: { prompt: 0.01, completion: 0.03 },
};

export function computeCost(
  tokensPrompt: number,
  tokensCompletion: number,
  model = "default"
): number {
  const rates = COST_RATES[model] ?? COST_RATES.default;
  return (
    (tokensPrompt / 1000) * rates.prompt +
    (tokensCompletion / 1000) * rates.completion
  );
}
