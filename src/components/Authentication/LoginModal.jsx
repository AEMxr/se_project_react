import ModalWithForm from "../App/ModalWithForm.jsx";
import FormField from "../App/FormField.jsx";
import useForm from "../../hooks/useForm.js";
import useTouch from "../../hooks/useTouch.js";
import useFormSubmit from "../../hooks/useFormSubmit.js";
import formValidation, {
  normalizeFormValues,
} from "../../hooks/formValidation.js";

const initialValues = { email: "", password: "" };
const initialTouched = { email: false, password: false };

export default function LoginModal({
  isOpen,
  onCloseModal,
  onSubmit,
  onSwitchToRegister,
}) {
  const { isSubmitting, submitForm, errorMessage } = useFormSubmit(isOpen);
  const { values: form, setValues, handleChange } = useForm(initialValues);
  const { touched, handleBlur, resetTouched } = useTouch(initialTouched);
  const { isFormValid, emailIsValid, passwordIsValid } = formValidation(
    form,
    "login",
  );

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
      title="Log In"
      name="login"
      buttonText="Log In"
      onClose={onCloseModal}
      onSubmit={handleSubmit}
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      isSubmitDisabled={!isFormValid}
      errorMessage={errorMessage}
      pendingText="Logging in..."
      secondaryAction={
        <button
          className="modal__secondary-action interactive"
          type="button"
          onClick={onSwitchToRegister}
        >
          or Sign Up
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
        autoComplete="current-password"
        value={form.password}
        onChange={handleChange}
        onBlur={handleBlur}
        isTouched={touched.password}
        isValid={passwordIsValid}
        errorText="Enter your password."
      />
    </ModalWithForm>
  );
}
