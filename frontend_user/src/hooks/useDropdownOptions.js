// frontend_user/src/hooks/useDropdownOptions.js
// ─────────────────────────────────────────────────────────────────────────────
// Fetches all dropdown options ONCE per page load and caches them in memory.
// Both CreatorRoleProfile and CollabretorRoleProfile share the same cache,
// so only 1 network request is ever made per session.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import api from "../utils/axiosConfig";   // adjust path if needed

// Module-level cache (survives re-renders, cleared on full page refresh)
let _cache = null;
let _promise = null;

export function useDropdownOptions() {
  const [options, setOptions] = useState(_cache || {});
  const [loading, setLoading] = useState(!_cache);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (_cache) {
      setOptions(_cache);
      setLoading(false);
      return;
    }

    // Only one fetch in-flight at a time even if two components mount together
    if (!_promise) {
      _promise = api.get("/dropdown-options/all");
    }

    _promise
      .then(res => {
        _cache = res.data;
        setOptions(_cache);
        setLoading(false);
      })
      .catch(err => {
        console.error("useDropdownOptions: fetch failed", err);
        setError(err);
        setLoading(false);
        _promise = null;   // allow retry on next mount
      });
  }, []);

  /**
   * getOptions(category, placeholder?)
   * Returns [{value:"", label: placeholder}, ...items]
   * Ready to pass directly to CustomDropdown's `options` prop.
   *
   * @param {string} category   - e.g. "creator_category"
   * @param {string} placeholder - e.g. "Select category"
   */
  const getOptions = (category, placeholder = "Select...") => [
    { value: "", label: placeholder },
    ...(options[category] || []),
  ];

  /**
   * invalidate()
   * Call this if you want to force a fresh fetch (e.g. after admin saves).
   */
  const invalidate = () => {
    _cache   = null;
    _promise = null;
    setLoading(true);
    setOptions({});
  };

  return { options, loading, error, getOptions, invalidate };
}