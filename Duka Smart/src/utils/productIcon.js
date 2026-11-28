// a friendly picture for a product, picked from its name or category (no image upload needed)
const BY_NAME = [
  [/unga|maize|flour|posho/i, ], [/sugar/i, ], [/oil|fat/i, ], [/rice/i, ],
  [/milk|yogh?urt/i, ], [/bread|bun|cake/i, ], [/tea/i, ], [/coffee/i, ],
  [/soap|detergent|wash/i, ], [/salt/i, ], [/egg/i, ], [/water|juice|soda|drink/i, ],
  [/tomato/i, ], [/onion/i, ], [/potato/i,], [/banana/i, ], [/meat|beef|chicken/i, ],
  [/bean|lentil|green gram|ndengu/i, ], [/biscuit|cookie|snack/i, ], [/airtime|bundle/i, ],
  [/book|pen|pencil|paper/i, ], [/tooth|lotion|cream/i, ],
];
const BY_CATEGORY = [
  [/drink|beverage/i, ], [/dairy/i, ], [/bakery/i, ], [/house|clean/i, ],
  [/groc|flour|grain|sugar|cook/i, ], [/snack|sweet/i, ], [/fresh|produce/i, ], [/airtime/i, ],
  [/station/i, ], [/personal/i, ],
];

export function productIcon(p) {
  const name = p.name || "";
  for (const [re, e] of BY_NAME) if (re.test(name)) return e;
  const cat = p.category || "";
  for (const [re, e] of BY_CATEGORY) if (re.test(cat)) return e;
  return ;
}

export function timeAgo(date) {
  const mins = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return mins + " min ago";
  const h = Math.round(mins / 60);
  if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago");
  const d = Math.round(h / 24);
  return d + (d === 1 ? " day ago" : " days ago");
}
