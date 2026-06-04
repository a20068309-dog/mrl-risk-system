
export const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "42px",
    borderRadius: "10px",
    borderColor: state.isFocused
      ? "#2563eb"
      : "#cbd5e1",

    boxShadow: state.isFocused
      ? "0 0 0 3px rgba(37,99,235,0.15)"
      : "none",

    "&:hover": {
      borderColor: "#2563eb"
    }
  }),

  valueContainer: (provided) => ({
    ...provided,
    padding: "0 12px"
  }),

  menu: (provided) => ({
    ...provided,
    borderRadius: "10px",
    overflow: "hidden"
  })
}