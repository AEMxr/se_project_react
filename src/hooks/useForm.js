import { useCallback, useState } from "react";

export default function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  }, []);
  return { values, setValues, handleChange };
}
