import { useState } from "react";

export default function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues);

  return { values, setValues };
}
