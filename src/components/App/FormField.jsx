import { useId } from "react";

export default function FormField({
  label,
  isTouched,
  isValid,
  errorText,
  ...inputProps
}) {
  const id = useId();
  const invalid = isTouched && !isValid;
  return (
    <label
      className={`modal__form-label${invalid ? " modal__form-label--invalid" : ""}`}
      htmlFor={id}
    >
      {label}
      <input
        {...inputProps}
        id={id}
        className={`modal__input${invalid ? " modal__input--invalid" : ""}`}
        required
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
      />
      {invalid && (
        <span id={`${id}-error`} className="modal__field-error">
          {errorText}
        </span>
      )}
    </label>
  );
}
