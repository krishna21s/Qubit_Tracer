import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import FAQS from './documentationData.json';

const categories = ['All', ...new Set(FAQS.map(faq => faq.category))];

function DocsHome() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const filteredList = FAQS
    .filter(faq => selectedCategory === 'All' || faq.category === selectedCategory)
    .filter(faq => faq.question.toLowerCase().includes(searchTerm.trim().toLowerCase()));

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  return (
    <div className="docs-root" style={{ padding: '24px' }}>
      <main>
        <div className="docs-hero">
          <h1>Documentation</h1>
          <p>Explore articles, guides, and API references.</p>
        </div>

        <div className="docs-toolbar" style={{ marginTop: '24px', marginBottom: '24px' }}>
          <div className="docs-search-wrap">
            <input
              type="text"
              className="docs-search"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="docs-filter-wrap">
            <select
              className="docs-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="docs-table-container">
          <table className="docs-table">
            <thead>
              <tr>
                <th>Article</th>
                <th style={{ width: '200px' }}>Category</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((faq) => (
                  <tr key={faq.id}>
                    <td>
                      <div className="docs-table-title">{faq.question}</div>
                      <div className="docs-table-desc">{faq.summary}</div>
                    </td>
                    <td>
                      <span className="docs-table-category">{faq.category}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/docs/${faq.slug}`} className="docs-action-btn">
                        Read
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="docs-empty">
                    No articles found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                style={{
                  background: currentPage === number ? 'var(--accent)' : 'transparent',
                  color: currentPage === number ? '#fff' : 'var(--slate)',
                  border: '1px solid var(--lightest-navy)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                {number}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default DocsHome;