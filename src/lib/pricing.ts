export interface CardPricing {
  cardName: string;
  setName: string;
  cardNumber: string;
  marketPrice: number | null;
  lowPrice: number | null;
  midPrice: number | null;
  highPrice: number | null;
  foilMarketPrice: number | null;
  foilHighPrice: number | null;
  priceSource: string;
  lastUpdated: string;
}

function scoreMatch(card: any, cardName: string, setName: string, cardNumber: string, rarity: string | undefined): number {
  let score = 0;
  // Exact card number match — highest priority
  if (cardNumber && card.number === cardNumber) score += 100;
  // Set name match
  if (setName && card.set?.name) {
    const cn = card.set.name.toLowerCase();
    const sn = setName.toLowerCase();
    if (cn === sn) score += 50;
    else if (cn.includes(sn) || sn.includes(cn)) score += 30;
  }
  // Rarity match
  if (rarity && card.rarity) {
    if (card.rarity.toLowerCase() === rarity.toLowerCase()) score += 20;
    else if (card.rarity.toLowerCase().includes(rarity.toLowerCase()) || rarity.toLowerCase().includes(card.rarity.toLowerCase())) score += 10;
  }
  // Prefer newer sets (higher release date)
  if (card.set?.releaseDate) {
    const year = parseInt(card.set.releaseDate.substring(0, 4), 10);
    if (!isNaN(year)) score += Math.min(year - 1990, 35); // up to ~35 points for recency
  }
  return score;
}

function extractPrices(card: any, isRare: boolean): CardPricing | null {
  const prices = card.tcgplayer?.prices;
  if (!prices) return null;

  const normalPrices = prices.normal || prices.unlimited || null;
  const foilPrices = prices.holofoil || prices.reverseHolofoil || null;

  const marketPrice = normalPrices?.market || foilPrices?.market || null;
  const foilMarketPrice = foilPrices?.market || null;

  if (!marketPrice && !foilMarketPrice) return null;

  // Filter out cheap reprints when we expect a rare card
  const effectiveMarket = marketPrice || foilMarketPrice || 0;
  if (isRare && effectiveMarket < 5) return null;

  // Pick prices from the same tier for consistency
  const primaryPrices = foilPrices || normalPrices;
  let low = primaryPrices?.low || null;
  let high = primaryPrices?.high || null;
  const mid = primaryPrices?.mid || null;
  const market = primaryPrices?.market || marketPrice;

  // Sanity check: filter out ranges wider than 10x market
  if (low && high && market && high > market * 10) {
    high = null;
    low = null;
  }

  return {
    cardName: card.name,
    setName: card.set?.name,
    cardNumber: card.number,
    marketPrice: market,
    lowPrice: low,
    midPrice: mid,
    highPrice: high,
    foilMarketPrice,
    foilHighPrice: foilPrices?.high || null,
    priceSource: 'TCGPlayer via Pokemon TCG API',
    lastUpdated: card.tcgplayer?.updatedAt || 'Unknown',
  };
}

export async function fetchCardPricing(
  cardName: string,
  setName: string,
  cardNumber: string,
  rarity?: string
): Promise<CardPricing | null> {
  try {
    const isRare = !!(rarity && /illustration rare|special illustration|hyper rare|secret|rare holo|ultra rare/i.test(rarity));

    // Build queries — add rarity for rare cards
    const rarityFilter = rarity && /illustration rare|special illustration|hyper rare|secret/i.test(rarity)
      ? ` rarity:"${rarity}"`
      : '';

    const queries = [
      cardNumber ? `name:"${cardName}" number:"${cardNumber}"${rarityFilter}` : null,
      `name:"${cardName}"${rarityFilter}`,
      `name:"${cardName}"`,
    ].filter(Boolean) as string[];

    for (const query of queries) {
      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&pageSize=15`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (!response.ok) continue;
      const data = await response.json();
      if (!data.data || data.data.length === 0) continue;

      // Score all results and pick the best match
      const scored = data.data
        .map((card: any) => ({ card, score: scoreMatch(card, cardName, setName, cardNumber, rarity) }))
        .sort((a: any, b: any) => b.score - a.score);

      // Try each candidate in order of score
      for (const { card } of scored) {
        const pricing = extractPrices(card, isRare);
        if (pricing) {
          console.log(`[Pricing] Matched: ${card.name} | Set: ${card.set?.name} | #${card.number} | Rarity: ${card.rarity} | Market: $${pricing.marketPrice}`);
          return pricing;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}
