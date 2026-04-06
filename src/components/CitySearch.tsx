import type { ChangeEvent, FormEvent } from 'react';

import type { CityOption } from '../types';
import './CitySearch.css';

type CitySearchProps = {
  query: string;
  suggestions: CityOption[];
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onSelect: (city: CityOption) => void;
};

export function CitySearch({
  query,
  suggestions,
  loading,
  onQueryChange,
  onSearch,
  onSelect,
}: CitySearchProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onQueryChange(event.target.value);
  }

  return (
    <section className="city-search">
      <form className="city-search__form" onSubmit={handleSubmit}>
        <input
          className="city-search__input"
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Введите город"
        />
        <button className="city-search__button" type="submit" disabled={loading}>
          {loading ? 'Поиск...' : 'Найти'}
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="city-search__list">
          {suggestions.map((city) => (
            <button
              key={`${city.name}-${city.lat}-${city.lon}`}
              className="city-search__item"
              type="button"
              onClick={() => onSelect(city)}
            >
              {city.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
