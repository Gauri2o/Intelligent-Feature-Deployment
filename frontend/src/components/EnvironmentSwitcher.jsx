import { useEnvironment } from "../context/EnvironmentContext";

function EnvironmentSwitcher() {
  const { environments, selectedEnvironmentId, selectedEnvironmentName, loading, setEnvironment } =
    useEnvironment();

  return (
    <label className="environment-switcher" title="Change active environment">
      <span className="environment-switcher-label">Environment</span>
      <span className="environment-switcher-control">
        <span className="environment-switcher-dot" aria-hidden="true" />
        <select
          value={selectedEnvironmentId ?? ""}
          disabled={loading || !environments.length}
          onChange={(e) => setEnvironment(Number(e.target.value))}
          aria-label={`Active environment: ${selectedEnvironmentName}`}
        >
          {!environments.length && <option value="">No environments</option>}
          {environments.map((env) => (
            <option key={env.id} value={env.id}>{env.name}</option>
          ))}
        </select>
      </span>
    </label>
  );
}

export default EnvironmentSwitcher;
