import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import SearchBar from '../components/SearchBar';
import VideoFilter from '../components/VideoFilter';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import Error from '../components/Error';
import apiService from '../services/api';
import '../styles/Home.css';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    category: 'all',
    search: ''
  });

  const location = useLocation();

  const [sortBy, setSortBy] = useState('latest');

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (filters.search && filters.search.trim() !== '') {
        const res = await apiService.search(filters.search);
        setUsers(res.users || []);
        setVideos(res.videos || []);
        setTotalPages(1);
      } else {
        const response = await apiService.getVideos({
          page: currentPage,
          limit: 12,
          category: filters.category,
          sortBy,
          search: filters.search
        });

        setVideos(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
        setUsers([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters.category, filters.search, sortBy]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search') || params.get('q') || '';

    if (q !== filters.search) {
      setFilters(prev => ({ ...prev, search: q }));
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const handleSearch = (query) => {
    setFilters(prev => ({
      ...prev,
      search: query
    }));
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <SearchBar onSearch={handleSearch} />

        {users && users.length > 0 && (
          <div className="search-users">
            <h3>Users</h3>
            <div className="users-list">
              {users.map(u => (
                <Link key={u._id} to={`/profile/${u._id}`} className="search-user-item">
                  <div className="user-badge">
                    {(u.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{u.username}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <VideoFilter
          filters={filters}
          sortBy={sortBy}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
        />

        {error && (
          <Error
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        {loading ? (
          <Loading />
        ) : videos.length > 0 ? (
          <>
            <div className="videos-grid">
              {videos.map(video => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="no-videos">
            <p>No videos found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
