import { useEffect, useRef, useState } from "react";
import type { FindRecord, IpCountry } from "../types";
import { findCountryByIp } from "../api/ip-country.api";

export function useIpCountries(results: FindRecord[]) {
  const [countries, setCountries] = useState<Record<string, IpCountry | null>>({});
  const countriesRef = useRef<Record<string, IpCountry | null>>({});

  useEffect(() => {
    const ips = Array.from(
      new Set(results.flatMap((record) => (record.ip ? [record.ip] : []))),
    ).filter((ip) => !(ip in countriesRef.current));
    if (!ips.length) return;

    const controller = new AbortController();
    let nextIndex = 0;

    async function lookupNextIp() {
      while (nextIndex < ips.length && !controller.signal.aborted) {
        const ip = ips[nextIndex++];
        try {
          const country = await findCountryByIp(ip, controller.signal);
          if (!controller.signal.aborted) {
            countriesRef.current[ip] = country;
            setCountries((current) => ({ ...current, [ip]: country }));
          }
        } catch {
          if (controller.signal.aborted) return;
          countriesRef.current[ip] = null;
          setCountries((current) => ({ ...current, [ip]: null }));
        }
      }
    }

    void Promise.all(
      Array.from({ length: Math.min(4, ips.length) }, () => lookupNextIp()),
    );
    return () => controller.abort();
  }, [results]);

  return countries;
}
