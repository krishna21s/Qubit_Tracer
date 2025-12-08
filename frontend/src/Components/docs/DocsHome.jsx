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
    <div className="docs-root">
      <main>
        <div className="spotlight-container">
          <div className="spotlight-content">
            <h1 className="page-title">Quantum State Visualizer Docs</h1>
            <p className="subtitle">Start typing to find an article, or filter by category.</p>

            <div className="controls-wrapper">
              <div className="search-box">
                <input
                  type="text"
                  className="search-bar-spotlight"
                  placeholder="Search all articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-container" ref={dropdownRef}>
                <button
                  className={`filter-button ${selectedCategory !== 'All' ? 'active' : ''}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {selectedCategory === 'All' ? 'Filter by Category' : selectedCategory}
                </button>
                {isDropdownOpen && (
                  <div className="filter-dropdown-panel">
                    <ul>
                      {categories.map(category => (
                        <li key={category} onClick={() => handleCategorySelect(category)}>
                          <div className={`custom-checkbox ${selectedCategory === category ? 'checked' : ''}`}>
                            <span className="tick">✔</span>
                          </div>
                          <span>{category}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="results-panel">
            <div className="faq-grid">
              {currentItems.length > 0 ? (
                currentItems.map((faq) => (
                  <div key={faq.id} className="faq-item-card">
                    <h3>{faq.question}</h3>
                    <p>{faq.summary}</p>
                    <Link to={`/docs/${faq.slug}`} className="answer-link">
                      Get into the details
                    </Link>
                  </div>
                ))
              ) : (
                <p className="no-results">No questions found for the selected criteria.</p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination-container">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`page-btn ${currentPage === number ? 'active' : ''}`}
                  >
                    {number}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DocsHome;