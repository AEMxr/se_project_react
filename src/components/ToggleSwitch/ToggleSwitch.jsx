import { useContext, useId } from "react";
import CurrentTemperatureUnitContext from "../../contexts/CurrentTemperatureUnitContext.js";
import "./ToggleSwitch.css";

export default function ToggleSwitch({
  isOn: isOnProp,
  handleToggle: handleToggleProp,
}) {
  const context = useContext(CurrentTemperatureUnitContext);
  const id = useId();
  const isOn = isOnProp ?? context?.currentTemperatureUnit === "C";
  const handleToggle = handleToggleProp ?? context?.handleToggleSwitchChange;
  return (
    <div
      className={`toggle-switch${isOn ? " toggle-switch_unit_celsius" : ""}`}
    >
      <input
        className="toggle-switch__input"
        id={id}
        type="checkbox"
        checked={isOn}
        onChange={handleToggle}
        aria-label="Use Celsius"
      />
      <label className="toggle-switch__label interactive" htmlFor={id}>
        <span className="toggle-switch__text toggle-switch__text_side_left">
          F
        </span>
        <span className="toggle-switch__text toggle-switch__text_side_right">
          C
        </span>
        <span className="toggle-switch__button" />
      </label>
    </div>
  );
}
