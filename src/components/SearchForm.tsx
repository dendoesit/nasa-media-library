import React from 'react';

interface SearchFormProps {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  yearStart: string;
  setYearStart: React.Dispatch<React.SetStateAction<string>>;
  yearEnd: string;
  setYearEnd: React.Dispatch<React.SetStateAction<string>>;
  onSearch: () => void;
}

const SearchForm = (props: SearchFormProps) => {
    const {query,setQuery,yearStart,setYearStart,yearEnd,setYearEnd,onSearch} = props;

  return (
    <form className="search-form" onSubmit={(e) => e.preventDefault()}>
      <input
        type="text"
        placeholder="Search for media"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <input
        type="number"
        placeholder="Start Year (optional)"
        value={yearStart}
        onChange={(e) => setYearStart(e.target.value)}
      />
      <input
        type="number"
        placeholder="End Year (optional)"
        value={yearEnd}
        onChange={(e) => setYearEnd(e.target.value)}
      />
      <button onClick={onSearch}>Search</button>
    </form>
  );
};

export default SearchForm;
