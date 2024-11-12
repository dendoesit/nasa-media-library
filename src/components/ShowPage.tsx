// ShowPage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCollectionDetails } from '../services/nasaApi';

const ShowPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchCollectionDetails = async () => {
      setLoading(true);
      try {
        const details = await getCollectionDetails(collectionId);
        setCollection(details);
      } catch (err) {
        setError('Failed to fetch collection details');
      } finally {
        setLoading(false);
      }
    };

    if (collectionId) {
      fetchCollectionDetails();
    }
  }, [collectionId]);

  const handleBack = () => {
    navigate('/');
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  if (!collection) return <p>No details available for this collection.</p>;
  const { title, description, keywords } = collection.data[0];
  const images = collection.links


  // Select an image (highest quality or preferred)
  const imageUrl = images && images.length > 0 ? images[0].href : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <Link to="/" className="inline-block mt-4 text-blue-600 hover:underline">
        Back to Search
      </Link>
    </div>
    <div className="text-center mb-8">
          <img
            src={imageUrl}
            className="w-full max-w-4xl mx-auto rounded-lg shadow-md mb-4"
            alt={title}
          />
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
      {description && <p><strong>Description:</strong> {description}</p>}
      {keywords && keywords.length > 0 && (
        <p><strong>Keywords:</strong> {keywords.join(', ')}</p>
      )}

    </div>
  );
};

export default ShowPage;
