const VALID_WEATHER_TYPES = ["hot", "warm", "cold"];
const VALID_IMAGE_PROTOCOLS = ["http:", "https:"];

function isValidImageUrl(value) {
  if (value === "") {
    return false;
  }

  try {
    const parsedUrl = new URL(value);

    return VALID_IMAGE_PROTOCOLS.includes(parsedUrl.protocol);

  } catch {
    return false;
  }
}

export default function formValidation(
  values = { name: "", image: "", weather: "", avatar: "", email: "", password: "" }, 
  formType = "clothing"
) {
  const name = values.name ?? "";
  const image = values.image ?? "";
  const weather = values.weather ?? "";
  const avatar = values.avatar ?? "";
  const email = values.email ?? "";
  const password = values.password ?? "";

  const nameIsValid = name.length >= 2 && name.length <= 30;
  
  const imageIsValid = isValidImageUrl(image);
  const avatarIsValid = isValidImageUrl(avatar);
  
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  let passwordIsValid;

  if (formType === "login") {
    passwordIsValid = password.length > 0;
  } else {
    passwordIsValid =
    password.length >= 8 &&
    /[0-9]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[!@#$%^&*()]/.test(password);
  }
  
  // const passwordIsValid =
  //   password.length >= 8 &&
  //   /[0-9]/.test(password) &&
  //   /[A-Z]/.test(password) &&
  //   /[!@#$%^&*()]/.test(password);

  const weatherIsValid = VALID_WEATHER_TYPES.includes(weather);

  let isFormValid = false;

  if (formType === "clothing") {
    isFormValid = nameIsValid && imageIsValid && weatherIsValid;
  }
  else if(formType === "registration") {
    isFormValid = nameIsValid && avatarIsValid && emailIsValid && passwordIsValid;
  }
  else if(formType === "login") {
    isFormValid = emailIsValid && passwordIsValid;
  }
  else if (formType === "profile") {
    isFormValid = nameIsValid && avatarIsValid;
}
  
  // const isFormValid =
  //   nameIsValid &&
  //   (formType === "clothing"
  //     ? imageIsValid && weatherIsValid
  //     : formType === "registration" &&
  //       avatarIsValid &&
  //       emailIsValid &&
  //       passwordIsValid);



  return { nameIsValid, imageIsValid, avatarIsValid, emailIsValid, passwordIsValid, weatherIsValid, isFormValid };
}

  // let passwordIsValid;
  
  // if (password.length < 8) {
  //   passwordIsValid = false;}
  // else {
  //   const hasDigit = /[0-9]/.test(password);
  //   const hasCapitalLetter = /[A-Z]/.test(password);
  //   const hasSpecialCharacter = /[!@#$%^&*()]/.test(password);
    
  //   passwordIsValid = hasDigit && hasSpecialCharacter && hasCapitalLetter;
  
  // } 

// let weatherIsValid;

// if (weather === "hot" || weather === "warm" || weather === "cold") {
//   weatherIsValid = true;
// } else {
//   weatherIsValid = false;
// }

// let isFormValid = false;

// if (formType === "clothing") {
//   isFormValid = nameIsValid && imageIsValid && weatherIsValid;
// } else if (formType === "registration") {
//   isFormValid = nameIsValid && avatarIsValid && emailIsValid && passwordIsValid;
// }

  // const isFormValid = nameIsValid && imageIsValid && weather.trim() !== ""  || 
  //   nameIsValid && avatarIsValid && emailIsValid && passwordIsValid === true;
