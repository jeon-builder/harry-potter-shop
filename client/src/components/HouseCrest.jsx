function HouseCrest({ house }) {
  return (
    <button type="button" className={`house-crest house-crest-${house.id}`}>
      <span className="house-crest-mark" aria-hidden="true" />
      <strong>{house.name}</strong>
      <span>{house.ko}</span>
    </button>
  );
}

export default HouseCrest;
