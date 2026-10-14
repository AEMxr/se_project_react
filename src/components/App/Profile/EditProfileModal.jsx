import { useContext, useEffect, useState } from "react";
import CurrentUserContext from "../../../contexts/CurrentUserContext.js";
import useForm from "../../../hooks/useForm.js";
import useTouch from "../../../hooks/useTouch.js";
import ModalWithForm from "../ModalWithForm.jsx";
import formValidation from "../../../hooks/formValidation.js";

const initialValues = {
  name: "",
  avatar: "",
};

const initialTouched = {
  name: false,
  avatar: false,
};

function EditProfileModal({ isOpen, onSubmit, onCloseModal }) {
  const currentUser = useContext(CurrentUserContext);

  const { values: form, setValues: setForm } = useForm(initialValues);
  const { touched, handleBlur, resetTouched } = useTouch(initialTouched);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { nameIsValid, avatarIsValid, isFormValid } = formValidation(form, "profile");

  useEffect(() => {
    if (!isOpen || !currentUser) {
      return;
    }

    setForm({
      name: currentUser.name,
      avatar: currentUser.avatar,
    });

    resetTouched();
  }, [isOpen, currentUser, setForm, resetTouched]);

  function handleChange(event) {
  const { name, value } = event.target;
  setForm((prev) => ({ ...prev, [name]: value }));
}

function handleSubmit(event) {
  event.preventDefault();

  if (!isFormValid || isSubmitting) {
    return;
  }

  setIsSubmitting(true);

  onSubmit(form)
    .then(() => {
      onCloseModal();
    })
    .catch(console.error)
    .finally(() => {
      setIsSubmitting(false);
    });
}

  return (
  <ModalWithForm
    title="Change profile data"
    name="edit-profile"
    buttonText="Save changes"
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
}

export default EditProfileModal;