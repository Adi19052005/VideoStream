import React from 'react';
import '../styles/VideoFilter.css';

const VideoFilter = ({
  filters,
  sortBy,
  onFilterChange,
  onSortChange
}) => {

  const handleCategoryChange = (e) => {
    onFilterChange({ category: e.target.value });
  };

  const handleSortChange = (e) => {
    onSortChange(e.target.value);
  };

  return (
    <div className="video-filter">
      <div className="filter-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={filters.category}
          onChange={handleCategoryChange}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="education">Education</option>
          <option value="entertainment">Entertainment</option>
          <option value="music">Music</option>
          <option value="gaming">Gaming</option>
          <option value="sports">Sports</option>
          <option value="vlog">Vlog</option>
          <option value="tutorial">Tutorial</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="sort">Sort By</label>
        <select
          id="sort"
          value={sortBy}
          onChange={handleSortChange}
          className="filter-select"
        >
          <option value="latest">Latest</option>
          <option value="popular">Most Popular</option>
          <option value="trending">Trending</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>
  );
};

export default VideoFilter;
