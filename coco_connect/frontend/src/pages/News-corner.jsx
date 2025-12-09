import React from "react";

const NewsCorner = () => {
  return (
    <div className="news-corner-page">
      {/* HEADER */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo-section">
            <a href="#" className="logo">
              <i className="fas fa-leaf logo-icon" />
              <div className="logo-text">
                <h1>
                  CocoConnect
                  <span style={{ color: "var(--accent-light)" }}>.</span>
                </h1>
                <div className="tagline">Connecting the Coconut World</div>
              </div>
            </a>
            <div className="premium-badge">
              <i className="fas fa-crown" />
              PREMIUM NEWS CORNER
            </div>
          </div>

          <div className="header-actions">
            <div className="search-container">
              <div className="search-icon">
                <i className="fas fa-search" />
              </div>
              <input
                type="text"
                className="search-bar"
                placeholder="Search news, topics, authors..."
              />
            </div>

            <button className="btn-primary" type="button">
              <i className="fas fa-plus-circle" />
              Publish News
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="main-container">
        {/* HERO */}
        <section className="hero-section">
          <h1>🌴 Coconut News Corner</h1>
          <p>
            Your premier source for coconut industry updates, market insights,
            and community news. Stay connected with the latest trends and
            developments from around the coconut world.
          </p>
          <div className="hero-stats">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">128</div>
                <div className="stat-label">Total News</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">2.4K</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">48</div>
                <div className="stat-label">Paid Publishers</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">4.7</div>
                <div className="stat-label">Avg Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* SORT BAR */}
        <nav className="sort-navigation">
          <div className="sort-title">Sort by:</div>
          <button className="sort-btn active" type="button">
            <i className="fas fa-clock" />
            Newest
          </button>
          <button className="sort-btn" type="button">
            <i className="fas fa-fire" />
            Trending
          </button>
          <button className="sort-btn" type="button">
            <i className="fas fa-heart" />
            Most Popular
          </button>
          <button className="sort-btn" type="button">
            <i className="fas fa-star" />
            Highest Rated
          </button>
        </nav>

        {/* CATEGORY FILTER */}
        <div className="category-filter">
          <button className="category-btn active" type="button">
            All Categories
          </button>
          <button className="category-btn" type="button">
            Market
          </button>
          <button className="category-btn" type="button">
            Sustainability
          </button>
          <button className="category-btn" type="button">
            Investment
          </button>
          <button className="category-btn" type="button">
            Technology
          </button>
          <button className="category-btn" type="button">
            Products
          </button>
        </div>

        {/* NEWS GRID (STATIC FOR NOW) */}
        <main className="main-content">
          <div className="news-grid">
            <article className="news-card">
              <span className="publisher-badge paid">Premium Publisher</span>
              <div className="news-image-container">
                <img
                  className="news-image"
                  src="https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&w=600&q=80"
                  alt="Coconut market"
                />
              </div>
              <div className="news-content">
                <span className="news-category">MARKET</span>
                <h3 className="news-title">
                  Global Coconut Water Market to Reach $10B by 2025
                </h3>
                <p className="news-excerpt">
                  New market analysis shows unprecedented growth in coconut water
                  consumption worldwide, with Asia-Pacific leading the expansion.
                </p>
                <div className="news-meta">
                  <span>
                    <i className="fas fa-user" /> Market Insights Pro
                  </span>
                  <span>
                    <i className="fas fa-clock" /> 2 hours ago
                  </span>
                </div>
              </div>
            </article>
          </div>

          <div style={{ textAlign: "center", margin: "2rem 0" }}>
            <button
              className="submit-btn"
              type="button"
              style={{ maxWidth: 200, margin: "0 auto" }}
            >
              <i className="fas fa-sync-alt" />
              Load More News
            </button>
          </div>
        </main>

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-card">
            <h2 className="sidebar-title">
              <i className="fas fa-pen-alt" />
              Publish Your News
            </h2>
            <div className="publish-form">
              <div className="publisher-type-selector">
                <button
                  className="publisher-type-btn free active"
                  type="button"
                >
                  <i className="fas fa-user" />
                  Free Publisher
                </button>
                <button className="publisher-type-btn paid" type="button">
                  <i className="fas fa-crown" />
                  Paid Publisher
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="newsTitle">News Title</label>
                <input
                  id="newsTitle"
                  className="form-input"
                  type="text"
                  placeholder="Enter your news headline"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newsCategory">Category</label>
                <select id="newsCategory" className="form-select">
                  <option value="">Select category</option>
                  <option value="market">Market Prices</option>
                  <option value="investment">Investment</option>
                  <option value="sustainability">Sustainability</option>
                  <option value="technology">Technology</option>
                  <option value="products">New Products</option>
                  <option value="events">Events</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="newsContent">News Content</label>
                <textarea
                  id="newsContent"
                  className="form-textarea"
                  placeholder="Write your news article..."
                />
              </div>

              <button className="submit-btn" type="button">
                <i className="fas fa-paper-plane" />
                Publish News
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default NewsCorner;