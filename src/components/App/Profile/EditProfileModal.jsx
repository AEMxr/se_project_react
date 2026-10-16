import { useContext, useEffect, useRef } from "react";
import CurrentUserContext from "../../../contexts/CurrentUserContext.js";
import useForm from "../../../hooks/useForm.js";
import useTouch from "../../../hooks/useTouch.js";
import useFormSubmit from "../../../hooks/useFormSubmit.js";
import formValidation, {
  normalizeFormValues,
} from "../../../hooks/formValidation.js";
import { NAME_MIN_LENGTH, NAME_MAX_LENGTH } from "../../../utils/constants.js";
import ModalWithForm from "../ModalWithForm.jsx";
import FormField from "../FormField.jsx";

const initialValues = { name: "", avatar: "" };
const initialTouched = { name: false, avatar: false };

export default function EditProfileModal({ isOpen, onSubmit, onCloseModal }) {
  const currentUser = useContext(CurrentUserContext);
  const { values: form, setValues, handleChange } = useForm(initialValues);
  const { touched, handleBlur, resetTouched } = useTouch(initialTouched);
  const { isSubmitting, submitForm, errorMessage } = useFormSubmit(isOpen);
  const prefilledUserId = useRef(null);
  const { nameIsValid, avatarIsValid, isFormValid } = formValidation(
    form,
    "profile",
  );

  useEffect(() => {
    if (!isOpen || !currentUser) {
      prefilledUserId.current = null;
      return;
    }
    if (prefilledUserId.current === currentUser._id) return;
    prefilledUserId.current = currentUser._id;
    setValues({
      name: currentUser.name ?? "",
      avatar: currentUser.avatar ?? "",
    });
    resetTouched();
  }, [isOpen, currentUser, setValues, resetTouched]);

  function handleSubmit(event) {
    event.preventDefault();
    if (isFormValid)
      submitForm(() => onSubmit(normalizeFormValues(form)), onCloseModal);
  }

  return (
    <ModalWithForm
      title="Change profile data"
      name="edit-profile"
      buttonText="Save changes"
      onClose={onCloseModal}
      onSubmit={handleSubmit}
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      isSubmitDisabled={!isFormValid}
      errorMessage={errorMessage}
    >
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
