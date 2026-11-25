import { useCallback, useEffect, useRef, useState } from "react";
import { loadShop } from "./api";

const empty = { products: [], categories: [], suppliers: [], sales: [], expenses: [] };

// loads everything a page needs from the backend; call reload() after changing something
export function useShop() {
  const [shop, setShop] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const first = useRef(true);

  const reload = useCallback(async () => {
    try {
      // the first load waits a moment, so the placeholder screen is seen and does not flash
      const [data] = await Promise.all([loadShop(), first.current ? new Promise((r) => setTimeout(r, 450)) : null]);
      first.current = false;
      setShop(data);
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
