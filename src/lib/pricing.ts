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

export async function fetchCardPricing(
  cardName: string,
  setName: string,
  cardNumber: string
): Promise<CardPricing | null> {
  try {
    const queries = [
      cardNumber ? `name:"${cardName}" number:"${cardNumber}"` : null,
      `name:"${cardName}"`,
    ].filter(Boolean) as string[];

    for (const query of queries) {
      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&pageSize=10`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (!response.ok) continue;
      const data = await response.json();
      if (!data.data || data.data.length === 0) continue;

      // Find the best matching card by set name
      let card = data.data[0];
      if (setName) {
        const setMatch = data.data.find((c: any) =>
          c.set?.name?.toLowerCase().includes(setName.toLowerCase()) ||
          setName.toLowerCase().includes(c.set?.name?.toLowerCase())
        );
        if (setMatch) card = setMatch;
      }

      const prices = card.tcgplayer?.prices;
      if (!prices) continue;

      const normalPrices = prices.normal || prices.unlimited || null;
      const foilPrices = prices.holofoil || prices.reverseHolofoil || null;

      const marketPrice = normalPrices?.market || foilPrices?.market || null;
      const foilMarketPrice = foilPrices?.market || null;

      // Skip if price is 0 or null
      if (!marketPrice && !foilMarketPrice) continue;

      return {
        cardName: card.name,
        setName: card.set?.name,
        cardNumber: card.number,
        marketPrice,
        lowPrice: normalPrices?.low || foilPrices?.low || null,
        midPrice: normalPrices?.mid || foilPrices?.mid || null,
        highPrice: normalPrices?.high || foilPrices?.high || null,
        foilMarketPrice,
        foilHighPrice: foilPrices?.high || null,
        priceSource: 'TCGPlayer via Pokemon TCG API',
        lastUpdated: card.tcgplayer?.updatedAt || 'Unknown',
      };
    }
    return null;
  } catch {
    return null;
  }
}
