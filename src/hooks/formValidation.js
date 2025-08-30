export default function formValidation(
  values = { name: "", image: "", weather: "" }
) {
  const name = values.name ?? "";
  const image = values.image ?? "";
  const weather = values.weather ?? "";

  const nameIsValid = /[A-Za-z0-9]/.test(name);
  const imageIsValid = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
    image
  );
  const isFormValid = nameIsValid && imageIsValid && weather.trim() !== "";

  return { nameIsValid, imageIsValid, isFormValid };
}
