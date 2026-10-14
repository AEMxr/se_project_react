import { useState, useEffect } from "react";
import ModalWithForm from "../App/ModalWithForm";
import useForm from "../../hooks/useForm.js";
import formValidation from "../../hooks/formValidation.js";
import useTouch from "../../hooks/useTouch.js";

const initialValues = { email: "", password: "" };

const initialTouched = {
  email: false,
  password: false
}

const LoginModal = ({ isOpen, onCloseModal, onSubmit, onSwitchToRegister }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { values: form, setValues: setForm } = useForm(initialValues);
  const { touched, handleBlur, resetTouched } = useTouch(initialTouched);

  const { isFormValid, emailIsValid, passwordIsValid } = 
    formValidation(form, "login");

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
      title="Log In"
      name="login"
      buttonText="Log In"
      onClose={onCloseModal}
      onSubmit={handleSubmit}
      isOpen={isOpen}
      isSubmitDisabled={isSubmitting || !isFormValid}
      secondaryAction={
        <button type="button" onClick={onSwitchToRegister}>
          or Sign Up
        </button>
      }
    >
      <label
        className={`modal__form-label${
          touched.email && !emailIsValid ? " modal__form-label--invalid" : ""
        }`}
      >
        Email
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
        Password
        <input
          type="password"
          name="password"
          placeholder="Password"
          className={`modal__input${
            touched.password && !passwordIsValid ? " modal__input--invalid" : ""
          }`}
          required
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </label>
    </ModalWithForm>
  );
};

export default LoginModal;
