import { useState, useEffect } from "react";
import ModalWithForm from "../App/ModalWithForm";
import useForm from "../../hooks/useForm.js";
import formValidation from "../../hooks/formValidation.js";
import useTouch from "../../hooks/useTouch.js";

const initialValues = { name: "", image: "", weather: "warm" };

const AddItemModal = ({ isOpen, onAddItem, onCloseModal }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { values: form, setValues: setForm } = useForm(initialValues);
  const { touched, handleBlur, resetTouched } = useTouch({
    name: false,
    image: false,
  });

  const { nameIsValid, imageIsValid, isFormValid } = formValidation(form);

  useEffect(() => {
    if (isOpen) {
      setForm(initialValues);
      resetTouched();
    }
  }, [isOpen, setForm, resetTouched]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    onAddItem(form)
      .then(() => {
        setForm(initialValues);
        resetTouched();
        onCloseModal && onCloseModal();
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <ModalWithForm
      title="New garment"
      name="add-clothes"
      buttonText="Add garment"
      onClose={onCloseModal}
      onSubmit={handleSubmit}
      isOpen={isOpen}
      isSubmitDisabled={isSubmitting || !isFormValid}
    >
      <label
        className={`modal__form-label${
          touched.name && !nameIsValid ? " modal__form-label--invalid" : ""
        }`}
      >
        Name
        <input
          type="text"
          name="name"
          placeholder="Name"
          className={`modal__input${
            touched.name && !nameIsValid ? " modal__input--invalid" : ""
          }`}
          required
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </label>
      <label
        className={`modal__form-label${
          touched.image && !imageIsValid ? " modal__form-label--invalid" : ""
        }`}
      >
        Image
        <input
          type="url"
          name="image"
          placeholder="Image URL"
          className={`modal__input${
            touched.image && !imageIsValid ? " modal__input--invalid" : ""
          }`}
          required
          value={form.image}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </label>
      <label className="modal__form-label">
        Select the weather type:
        <div className="modal__weather-radio-group">
          {["hot", "warm", "cold"].map((type) => (
            <label
              key={type}
              className={`modal__weather-radio${
                form.weather === type ? " modal__weather-radio--active" : ""
              }`}
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
      </label>
    </ModalWithForm>
  );
};

export default AddItemModal;
