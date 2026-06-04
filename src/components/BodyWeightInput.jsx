export default function BodyWeightInput({
  bodyWeight,
  setBodyWeight,
  className
}) {
  return (
    <input
      type="number"
      min="1"
      step="0.1"
      value={bodyWeight}
      onChange={(e) =>
        setBodyWeight(Number(e.target.value) || 0)
      }
      className={className}
    />
  )
}