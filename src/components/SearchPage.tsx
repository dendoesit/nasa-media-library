import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchMedia } from '../services/nasaApi';

const SearchPage = () => {
  const [query, setQuery] = useState<string>('');
  const [yearStart, setYearStart] = useState<string>('');
  const [yearEnd, setYearEnd] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // Handle form submission
  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchResults = await searchMedia(query, yearStart, yearEnd);
      setResults(searchResults);
    } catch (err) {
      console.error('Error during search', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'query') setQuery(value);
    else if (name === 'yearStart') setYearStart(value);
    else if (name === 'yearEnd') setYearEnd(value);
  };

  const handleResultClick = (nasaId: string) => {
    navigate(`/show/${nasaId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6 sm:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-red mb-8">Search NASA Media Library</h1>

        <div className="space-y-4">
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700">Search Query</label>
            <input
              id="query"
              type="text"
              name="query"
              value={query}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter keywords"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="yearStart" className="block text-sm font-medium text-gray-700">Year Start</label>
              <input
                id="yearStart"
                type="text"
                name="yearStart"
                value={yearStart}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Start Year"
              />
            </div>
            <div>
              <label htmlFor="yearEnd" className="block text-sm font-medium text-gray-700">Year End</label>
              <input
                id="yearEnd"
                type="text"
                name="yearEnd"
                value={yearEnd}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="End Year"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="mt-6 w-full py-2 px-6 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((result: any, index) => {
              const { nasa_id, title, description } = result.data[0];
              const { links } = result;

              let imageUrl = 'https://via.placeholder.com/150'; 
              if (links && Array.isArray(links) && links.length > 0) {
                imageUrl = links[0]?.href || 'https://via.placeholder.com/150'; // Fallback to placeholder if href is missing
              }

              return (
                <div
                  key={nasa_id}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                  onClick={() => handleResultClick(nasa_id)}
                >
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-56 object-cover rounded-md mb-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <p className="text-sm text-gray-600 truncate">{description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {results.length === 0 && !loading && (
          <p className="text-center text-gray-500 mt-8">No results found. Try a different query.</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
