import axios from 'axios';

// Define types for API responses
interface NASAImageLink {
  href: string;
}

export interface NASACollectionItem {
  data: {
    title: string;
    location?: string;
    photographer?: string;
    nasa_id: string;
    description?: string;
    keywords: string[];
  }[];
  links: NASAImageLink[];
}

const BASE_URL = 'https://images-api.nasa.gov/search';
const ASSETS_URL = 'https://images-api.nasa.gov/metadata';

export const searchMedia = async ( query: string, yearStart: string, yearEnd: string) => {
  const params: any = { q: query, media_type: 'image' };

  if (yearStart) params.year_start = yearStart;
  if (yearEnd) params.year_end = yearEnd;

  try {
    const response = await axios.get(BASE_URL, { params });
    return response.data.collection.items.map((item: any) => item);
  } catch (error) {
    console.error('Error during search', error);
    throw error;
  }
};

export const getCollectionDetails = async (collectionId: string | undefined) => {
  try {
    const response = await axios.get(`${BASE_URL}?nasa_id=${collectionId}`);
    return response.data.collection.items[0];
  } catch (error) {
    console.error('Error fetching collection details', error);
    throw error;
  }
};
