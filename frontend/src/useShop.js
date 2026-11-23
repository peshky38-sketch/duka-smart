import { useCallback, useEffect, useState } from "react";
import { loadShop } from "./api";

const empty = { products: [], categories: [], suppliers: [], sales: [], expenses: [] };

// loads everything a page needs from the backend; call reload() after changing something
export function useShop() {
  const [shop, setShop] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setShop(await loadShop());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...shop, loading, error, reload };
}
