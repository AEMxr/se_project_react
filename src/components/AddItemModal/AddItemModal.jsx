import ModalWithForm from "../App/ModalWithForm.jsx";
import FormField from "../App/FormField.jsx";
import useForm from "../../hooks/useForm.js";
import useTouch from "../../hooks/useTouch.js";
import useFormSubmit from "../../hooks/useFormSubmit.js";
import formValidation, {
  normalizeFormValues,
} from "../../hooks/formValidation.js";
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  VALID_WEATHER_TYPES,
} from "../../utils/constants.js";

const initialValues = { name: "", image: "", weather: "warm" };
const initialTouched = { name: false, image: false };

export default function AddItemModal({ isOpen, onAddItem, onCloseModal }) {
  const { isSubmitting, submitForm, errorMessage } = useFormSubmit(isOpen);
  const { values: form, setValues, handleChange } = useForm(initialValues);
  const { touched, handleBlur, resetTouched } = useTouch(initialTouched);
  const { nameIsValid, imageIsValid, isFormValid } = formValidation(form);

  function handleSubmit(event) {
    event.preventDefault();
    if (!isFormValid) return;
    submitForm(
      () => onAddItem(normalizeFormValues(form)),
      () => {
        setValues(initialValues);
        resetTouched();
        onCloseModal();
      },
    );
  }
  return (
    <ModalWithForm
      title="New garment"
      name="add-clothes"
      buttonText="Add garment"
      onClose={onCloseModal}
      onSubmit={handleSubmit}
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      isSubmitDisabled={!isFormValid}
      errorMessage={errorMessage}
      pendingText="Adding..."
    >
      <FormField
        label="Name"
        type="text"
        name="name"
        placeholder="Name"
        minLength={NAME_MIN_LENGTH}
        maxLength={NAME_MAX_LENGTH}
        value={form.name}
        onChange={handleChange}
        onBlur={handleBlur}
        isTouched={touched.name}
        isValid={nameIsValid}
        errorText="Enter a name with 2–30 characters."
      />
      <FormField
        label="Image"
        type="url"
        name="image"
        placeholder="Image URL"
        value={form.image}
        onChange={handleChange}
        onBlur={handleBlur}
        isTouched={touched.image}
        isValid={imageIsValid}
        errorText="Enter a complete http:// or https:// image URL."
      />
      <fieldset className="modal__weather-group">
        <legend className="modal__weather-legend">
          Select the weather type:
        </legend>
        <div className="modal__weather-radio-group">
          {VALID_WEATHER_TYPES.map((type) => (
            <label
              key={type}
              className={`modal__weather-radio interactive${form.weather === type ? " modal__weather-radio--active" : ""}`}
            >
              <input
                type="radio"
                name="weather"
                value={type}
                required
                checked={form.weather === type}
                onChange={handleChange}
                className="modal__weather-radio-input"
              />
              {type[0].toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>
      </fieldset>
    </ModalWithForm>
  );
}
