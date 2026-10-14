import { useState, useEffect } from "react";
import ModalWithForm from "../App/ModalWithForm";
import useForm from "../../hooks/useForm.js";
import formValidation from "../../hooks/formValidation.js";
import useTouch from "../../hooks/useTouch.js";

const initialValues = { 
  name: "",
  avatar: "",
  email: "",
  password: ""
 };

const initialTouched = {
  name: false,
  avatar: false,
  email: false,
  password: false
}

const RegisterModal = ({ isOpen, onSubmit, onCloseModal, onSwitchToLogin }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { values: form, setValues: setForm } = useForm(initialValues);
  const { touched, handleBlur, resetTouched } = useTouch(initialTouched);

  const { nameIsValid, isFormValid, avatarIsValid, emailIsValid, passwordIsValid } = 
    formValidation(form, "registration");

  useEffect(() => {
    if (!isOpen) return;
    setForm(initialValues);
    resetTouched();
  }, [isOpen, setForm, resetTouched]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    onSubmit(form)
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
      title="Sign Up"
      name="registration"
      buttonText="Sign Up"
      onClose={onCloseModal}
      onSubmit={handleSubmit}
      isOpen={isOpen}
      isSubmitDisabled={isSubmitting || !isFormValid}
      secondaryAction={
        <button type="button" onClick={onSwitchToLogin}>
          or Log In
        </button>
      }
    >
      <label
        className={`modal__form-label${
          touched.email && !emailIsValid ? " modal__form-label--invalid" : ""
        }`}
      >
        Email*
        <input
          type="email"
          name="email"
          placeholder="Email"
          className={`modal__input${
            touched.email && !emailIsValid ? " modal__input--invalid" : ""
          }`}
          required
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </label>
      <label
        className={`modal__form-label${
          touched.password && !passwordIsValid ? " modal__form-label--invalid" : ""
        }`}
      >
        Password*
        <input
          type="password"
          name="password"
          placeholder="password"
          className={`modal__input${
            touched.password && !passwordIsValid ? " modal__input--invalid" : ""
          }`}
          required
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </label>
      <label
        className={`modal__form-label${
          touched.name && !nameIsValid ? " modal__form-label--invalid" : ""
        }`}
      >
        Name*
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
          touched.avatar && !avatarIsValid ? " modal__form-label--invalid" : ""
        }`}
      >
        Avatar URL*
        <input
          type="url"
          name="avatar"
          placeholder="Avatar URL"
          className={`modal__input${
            touched.avatar && !avatarIsValid ? " modal__input--invalid" : ""
          }`}
          required
          value={form.avatar}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </label>
    </ModalWithForm>
  );
};

export default RegisterModal;
