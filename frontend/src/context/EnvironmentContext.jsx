import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "environment_id";
const NAME_KEY = "environment";
const EVENT_NAME = "ifd:environment-change";
const EnvironmentContext = createContext(null);

function readStoredId() {
  const id = Number(localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function EnvironmentProvider({ children }) {
  const [environments, setEnvironments] = useState([]);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(readStoredId);
  const [loading, setLoading] = useState(true);

  const setEnvironment = useCallback((id, list = environments) => {
    const selected = list.find((env) => Number(env.id) === Number(id));
    if (!selected) return;
    const numericId = Number(selected.id);
    setSelectedEnvironmentId(numericId);
    localStorage.setItem(STORAGE_KEY, String(numericId));
    localStorage.setItem(NAME_KEY, selected.name);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { id: numericId } }));
  }, [environments]);

  const loadEnvironments = useCallback(async () => {
    try {
      setLoading(true);
      const { default: api } = await import("../services/api");
      const response = await api.get("/environments/");
      const list = Array.isArray(response.data) ? response.data : [];
      setEnvironments(list);
      if (list.length) {
        const stored = readStoredId();
        const selected = list.find((env) => Number(env.id) === stored) || list[0];
        setEnvironment(selected.id, list);
      } else {
        setSelectedEnvironmentId(null);
      }
    } finally {
      setLoading(false);
    }
  }, [setEnvironment]);

  useEffect(() => { loadEnvironments(); }, [loadEnvironments]);

  useEffect(() => {
    const onChange = (event) => {
      const id = Number(event.detail?.id);
      if (environments.some((env) => Number(env.id) === id)) setSelectedEnvironmentId(id);
    };
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) onChange({ detail: { id: Number(event.newValue) } });
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [environments]);

  const selectedEnvironment = useMemo(
    () => environments.find((env) => Number(env.id) === Number(selectedEnvironmentId)) || null,
    [environments, selectedEnvironmentId]
  );

  return (
    <EnvironmentContext.Provider value={{
      environments,
      selectedEnvironmentId,
      selectedEnvironment,
      selectedEnvironmentName: selectedEnvironment?.name || "No environment",
      loading,
      refreshEnvironments: loadEnvironments,
      setEnvironment: (id) => setEnvironment(id),
    }}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const value = useContext(EnvironmentContext);
  if (!value) throw new Error("useEnvironment must be used inside EnvironmentProvider");
  return value;
}

export const ENVIRONMENT_CHANGE_EVENT = EVENT_NAME;