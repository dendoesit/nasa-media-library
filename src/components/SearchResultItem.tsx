import React from 'react';
import { NASACollectionItem } from '../services/nasaApi';

interface SearchResultItemProps {
  item: NASACollectionItem;
  onClick: () => void;
}

const SearchResultItem= (props: SearchResultItemProps) => {
    const {item, onClick} = props;
  const { title, location, photographer } = item.data[0];
  const imageHref = item.links[0]?.href; // Assuming the first link is the image URL

  return (
    <div className="search-result-item" onClick={onClick}>
      {imageHref && <img src={imageHref} alt={title} />}
      <h3>{title}</h3>
      {location && <p>{location}</p>}
      {photographer && <p>Photographer: {photographer}</p>}
    </div>
  );
};

export default SearchResultItem;
