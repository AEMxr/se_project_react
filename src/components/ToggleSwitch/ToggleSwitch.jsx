import React, { useContext } from "react";
import "./ToggleSwitch.css";
import CurrentTemperatureUnitContext from "../../contexts/CurrentTemperatureUnitContext";

const ToggleSwitch = ({ isOn: isOnProp, handleToggle: handleToggleProp }) => {
  const ctx = useContext(CurrentTemperatureUnitContext);
  const isOn = isOnProp ?? ctx?.currentTemperatureUnit === "C";
  const handleToggle =
    handleToggleProp ?? ctx?.handleToggleSwitchChange ?? (() => {});

  return (
    <>
      <input
        className="ToggleSwitch"
        id={`TempSwitchUnit`}
        type="checkbox"
        checked={isOn}
        onChange={handleToggle}
        aria-label="Toggle temperature unit (°F/°C)"
      />
      <label className="ToggleSwitch__label" htmlFor={`TempSwitchUnit`}>
        <span className="ToggleSwitch__text ToggleSwitch__text-left">F</span>
        <span className="ToggleSwitch__text ToggleSwitch__text-right">C</span>
        <span className="ToggleSwitch__button" />
      </label>
    </>
  );
};

export default ToggleSwitch;
