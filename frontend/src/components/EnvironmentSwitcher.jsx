import { useState } from "react";

function EnvironmentSwitcher() {
  const [environment, setEnvironment] = useState("Development");

  return (
    <select
      value={environment}
      onChange={(e) => setEnvironment(e.target.value)}
    >
      <option>Development</option>
      <option>Staging</option>
      <option>Production</option>
    </select>
  );
}

export default EnvironmentSwitcher;