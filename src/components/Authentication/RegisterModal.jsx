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
  PASSWORD_MIN_LENGTH,
} from "../../utils/constants.js";

const initialValues = { name: "", avatar: "", email: "", password: "" };
const initialTouched = {
  name: false,
  avatar: false,
  email: false,
  password: false,
};

export default function RegisterModal({
  isOpen,
  onSubmit,
  onCloseModal,
  onSwitchToLogin,
}) {
  const { isSubmitting, submitForm, errorMessage } = useFormSubmit(isOpen);
  const { values: form, setValues, handleChange } = useForm(initialValues);
  const { touched, handleBlur, resetTouched } = useTouch(initialTouched);
  const {
    nameIsValid,
    avatarIsValid,
    emailIsValid,
    passwordIsValid,
    isFormValid,
  } = formValidation(form, "registration");

  function handleSubmit(event) {
    event.preventDefault();
    if (!isFormValid) return;
    submitForm(
      () => onSubmit(normalizeFormValues(form)),
      () => {
        setValues(initialValues);
        resetTouched();
        onCloseModal();
      },
    );
  }
  return (
    <ModalWithForm
      title="Sign Up"
      name="registration"
      buttonText="Sign Up"
      onClose={onCloseModal}
      onSubmit={handleSubmit}
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      isSubmitDisabled={!isFormValid}
      errorMessage={errorMessage}
      pendingText="Signing up..."
      secondaryAction={
        <button
          className="modal__secondary-action interactive"
          type="button"
          onClick={onSwitchToLogin}
        >
          or Log In
        </button>
      }
    >
      <FormField
        label="Email*"
        type="email"
        name="email"
        placeholder="Email"
        autoComplete="email"
        value={form.email}
        onChange={handleChange}
        onBlur={handleBlur}
        isTouched={touched.email}
        isValid={emailIsValid}
        errorText="Enter a valid email address."
      />
      <FormField
        label="Password*"
        type="password"
        name="password"
        placeholder="Password"
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        value={form.password}
        onChange={handleChange}
        onBlur={handleBlur}
        isTouched={touched.password}
        isValid={passwordIsValid}
        errorText="Use at least 8 characters, an uppercase letter, a number, and a special character (!@#$%^&*())."
      />
      <FormField
        label="Name*"
        type="text"
        name="name"
        placeholder="Name"
        autoComplete="name"
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
        label="Avatar URL*"
        type="url"
        name="avatar"
        placeholder="Avatar URL"
        value={form.avatar}
        onChange={handleChange}
        onBlur={handleBlur}
        isTouched={touched.avatar}
        isValid={avatarIsValid}
        errorText="Enter a complete http:// or https:// image URL."
      />
    </ModalWithForm>
  );
}
