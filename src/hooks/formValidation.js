import isURL from "validator/lib/isURL.js";
import isEmail from "validator/lib/isEmail.js";
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  VALID_WEATHER_TYPES,
} from "../utils/constants.js";

export function normalizeFormValues(values) {
  return Object.fromEntries(
    Object.entries(values).map(([name, value]) => [
      name,
      name === "password" || typeof value !== "string" ? value : value.trim(),
    ]),
  );
}

function isValidImageUrl(value) {
  return isURL(value.trim(), {
    protocols: ["http", "https"],
    require_protocol: true,
    allow_protocol_relative_urls: false,
    disallow_auth: true,
  });
}

export default function formValidation(values = {}, formType = "clothing") {
  const name = (values.name ?? "").trim();
  const email = (values.email ?? "").trim();
  const password = values.password ?? "";
  const nameIsValid =
    name.length >= NAME_MIN_LENGTH && name.length <= NAME_MAX_LENGTH;
  const imageIsValid = isValidImageUrl(values.image ?? "");
  const avatarIsValid = isValidImageUrl(values.avatar ?? "");
  const emailIsValid = isEmail(email);
  const passwordIsValid =
    formType === "login"
      ? password.length > 0
      : password.length >= PASSWORD_MIN_LENGTH &&
        /[0-9]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[!@#$%^&*()]/.test(password);
  const weatherIsValid = VALID_WEATHER_TYPES.includes(values.weather);
  const formValidity = {
    clothing: nameIsValid && imageIsValid && weatherIsValid,
    registration:
      nameIsValid && avatarIsValid && emailIsValid && passwordIsValid,
    login: emailIsValid && passwordIsValid,
    profile: nameIsValid && avatarIsValid,
  };
  return {
    nameIsValid,
    imageIsValid,
    avatarIsValid,
    emailIsValid,
    passwordIsValid,
    weatherIsValid,
    isFormValid: formValidity[formType] ?? false,
  };
}
