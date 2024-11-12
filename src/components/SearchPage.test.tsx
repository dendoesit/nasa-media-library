import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // For navigation testing
import SearchPage from '../components/SearchPage'; // Import the component
import * as nasaApi from '../services/nasaApi'; // Import the nasaApi module
import React from 'react';

// Mock the searchMedia API function
jest.mock('../services/nasaApi');

describe('SearchPage', () => {
  it('renders the search form correctly', () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    // Check that input fields and button are rendered
    expect(screen.getByLabelText(/Search Query/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Year Start/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Year End/i)).toBeInTheDocument();
    expect(screen.getByText(/Search/i)).toBeInTheDocument();
  });

  it('handles user input and performs a search', async () => {
    // Mock the API response for a successful search
    const mockSearchResults = [
      {
        data: [
          {
            nasa_id: 'PIA12345',
            title: 'Moon Landing',
            description: 'The first moon landing.',
            links: [{ href: 'https://image.nasa.gov/1.jpg' }],
          },
        ],
      },
    ];

    // Ensure searchMedia returns a resolved value
    (nasaApi.searchMedia as jest.Mock).mockResolvedValue(mockSearchResults);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    // Simulate user typing in the search query
    fireEvent.change(screen.getByLabelText(/Search Query/i), {
      target: { value: 'moon' },
    });

    // Simulate user typing in the year fields
    fireEvent.change(screen.getByLabelText(/Year Start/i), {
      target: { value: '1969' },
    });
    fireEvent.change(screen.getByLabelText(/Year End/i), {
      target: { value: '1969' },
    });

    // Simulate clicking the search button
    fireEvent.click(screen.getByText(/Search/i));

    // Verify loading state
    expect(screen.getByText(/Searching.../i)).toBeInTheDocument();

    // Wait for the results to load
    await waitFor(() => {
      expect(screen.getByText('Moon Landing')).toBeInTheDocument();
    });
  });

  it('displays "No results" message when no results are found', async () => {
    // Mock the API response for no results
    (nasaApi.searchMedia as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    // Simulate user typing in the search query
    fireEvent.change(screen.getByLabelText(/Search Query/i), {
      target: { value: 'nonexistent' },
    });

    // Simulate clicking the search button
    fireEvent.click(screen.getByText(/Search/i));

    // Wait for the loading state to finish and check for "No results found" message
    await waitFor(() => {
      expect(screen.getByText(/No results found. Try a different query./i)).toBeInTheDocument();
    });
  });

  it('handles errors gracefully when search fails', async () => {
    // Mock an API error
    (nasaApi.searchMedia as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    // Simulate user typing in the search query
    fireEvent.change(screen.getByLabelText(/Search Query/i), {
      target: { value: 'moon' },
    });

    // Simulate clicking the search button
    fireEvent.click(screen.getByText(/Search/i));

    // Wait for the loading state to finish and check for "No results found" message
    await waitFor(() => {
      expect(screen.getByText(/No results found. Try a different query./i)).toBeInTheDocument();
    });
  });
});
