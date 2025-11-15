import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCar, FaBox, FaRoute, FaCalendarAlt, FaShuttleVan, FaSuitcaseRolling, 
  FaBuilding, FaGlobe, FaInfoCircle 
} from 'react-icons/fa';

// --- IMPORT OUR "SMART" COMPONENTS ---
import MagicBookingPanel from './MagicBookingPanel'; 
import MagicSuggestionCard from './MagicSuggestionCard';
import MapSection from './MapSection';
import DarkVeil from './DarkVeil';
import './App.css'; 
import travelHero from "./assets/travel-hero.png";
import friendsImg from "./assets/friends.png";

// CRITICAL: Import Mapbox GL CSS globally here
import 'mapbox-gl/dist/mapbox-gl.css'; 

// ===================================================================
//  MOCKUP & STATIC COMPONENTS
// ===================================================================

const AnimatedSection = ({ children, className = '' }) => {
  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 }
      }}
    >
      {children}
    </motion.section>
  );
};

const Header = () => (
  <header className="main-header">
    <div className="logo"> Z Cabs</div>
    <nav className="main-nav">
      <a href="#ride">Ride</a>
      <a href="#drive">Drive</a>
      <a href="#business">Business</a>
      <a href="#about">About</a>
    </nav>
    <div className="auth-buttons">
      <button className="btn-login">Log in</button>
      <button className="btn-signup">Sign up</button>
    </div>
  </header>
);

// UPDATED HeroSection with Map Inside
const HeroSection = ({ setPredictionResult, predictionResult }) => {
  // Determine availability level for styling
  const getAvailabilityClass = (availability) => {
    if (!availability) return '';
    const level = availability.toLowerCase();
    if (level === 'high') return 'availability-high';
    if (level === 'medium') return 'availability-medium';
    return 'availability-low';
  };

  return (
    <AnimatedSection className="hero-ride-section">
      <div className="hero-ride-content">
        <h1>Request a ride for now or later</h1>
        <MagicBookingPanel setPredictionResult={setPredictionResult} />
        
        {predictionResult.predictedTime && (
          <>
            {/* Prediction Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="prediction-result-box"
            >
              {/* Header with Availability Badge */}
              <div className="prediction-header">
                <h3>Prediction Results</h3>
                {predictionResult.availability && (
                  <span className={`availability-badge ${getAvailabilityClass(predictionResult.availability)}`}>
                    {predictionResult.availability}
                  </span>
                )}
              </div>

              <div className="prediction-content">
                {/* Main Stats Grid */}
                <div className="prediction-grid">
                  <div className="prediction-item">
                    <div className="prediction-item-label">Estimated Time</div>
                    <div className="prediction-item-value">{predictionResult.predictedTime}</div>
                  </div>
                  
                  <div className="prediction-item">
                    <div className="prediction-item-label">Estimated Fare</div>
                    <div className="prediction-item-value">₹{predictionResult.predictedFare}</div>
                  </div>
                </div>

                {/* Historical Data */}
                {(predictionResult.ridesLast3Days !== undefined || predictionResult.ridesLastWeek !== undefined) && (
                  <div className="historical-data">
                    <h4>Historical Ride Data</h4>
                    <div className="historical-stats">
                      {predictionResult.ridesLast3Days !== undefined && (
                        <div className="historical-stat">
                          <div className="historical-stat-label">Last 3 Days</div>
                          <div className="historical-stat-value">{predictionResult.ridesLast3Days}</div>
                          <div className="historical-stat-subtext">rides on this route</div>
                        </div>
                      )}
                      
                      {predictionResult.ridesLastWeek !== undefined && (
                        <div className="historical-stat">
                          <div className="historical-stat-label">Last Week</div>
                          <div className="historical-stat-value">{predictionResult.ridesLastWeek}</div>
                          <div className="historical-stat-subtext">rides on this route</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              
                {/* Alternative Suggestion */}
                {predictionResult.alternativeSuggestion && (
                  <div className="alternative-suggestion">
                    <FaInfoCircle className="alternative-icon" />
                    <div className="alternative-text">
                      <h4>Alternative Transportation</h4>
                      <p>{predictionResult.alternativeSuggestion}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Map Section - Only shown after prediction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ marginTop: '30px' }}
            >
              <MapSection predictionResult={predictionResult} />
            </motion.div>
          </>
        )}
      </div>
      
      <div className="hero-ride-image">
  <img src={travelHero} alt="Woman with suitcase and cab" />
</div>

    </AnimatedSection>
  );
};

const SuggestionsSection = () => (
  <AnimatedSection className="suggestions-section">
    <h2>Suggestions</h2>
    <div className="suggestions-grid">
      <MagicSuggestionCard
        icon={FaCar}
        title="Ride"
        description="Go anywhere with AIL. Request a ride, hop in, and go."
      />
      <MagicSuggestionCard
        icon={FaCalendarAlt}
        title="Reserve"
        description="Reserve your ride in advance so you can relax on the day."
      />
      <MagicSuggestionCard
        icon={FaRoute}
        title="Intercity"
        description="Get convenient, affordable outstation cabs anytime."
      />
      <MagicSuggestionCard
        icon={FaShuttleVan}
        title="Shuttle"
        description="Lower-cost shared rides on professionally driven buses."
      />
      <MagicSuggestionCard
        icon={FaBox}
        title="Courier"
        description="AIL makes same-day item delivery easier than ever."
      />
      <MagicSuggestionCard
        icon={FaSuitcaseRolling}
        title="Rentals"
        description="Request a trip for a block of time and make multiple stops."
      />
    </div>
  </AnimatedSection>
);

const FriendsPromoSection = () => (
  <AnimatedSection className="promo-section">
    <div className="promo-text">
      <h2>Ride with friends seamlessly</h2>
      <p>Riding with friends just got easier: set up a group ride in the AIL app, invite your friends, and arrive at your destination. Friends who ride together save together.</p>
    </div>
    <div className="promo-image">
  <img src={friendsImg} alt="Friends in a car" />
</div>
  </AnimatedSection>
);

const Footer = () => (
  <footer className="main-footer">
    <div className="footer-links">
      <div className="footer-column">
        <h4><FaBuilding /> About</h4>
        <ul>
          <li><a href="#about">About us</a></li>
          <li><a href="#offerings">Our offerings</a></li>
          <li><a href="#howitworks">How AIL works</a></li>
          <li><a href="#sustainability">Sustainability</a></li>
        </ul>
      </div>
      <div className="footer-column">
        <h4><FaGlobe /> Explore</h4>
        <p>Airports</p>
        <ul>
          <li><a href="#del">Delhi Airport</a></li>
          <li><a href="#bom">Mumbai Airport</a></li>
          <li><a href="#blr">Bengaluru Airport</a></li>
          <li><a href="#hyd">Hyderabad Airport</a></li>
          <li><a href="#maa">Chennai Airport</a></li>
        </ul>
      </div>
      <div className="footer-column">
        <h4>&nbsp;</h4>
        <p>Intercity routes</p>
        <ul>
          <li><a href="#pune-mum">Pune to Mumbai</a></li>
          <li><a href="#luck-kan">Lucknow to Kanpur</a></li>
          <li><a href="#mum-pune">Mumbai to Pune</a></li>
          <li><a href="#del-math">Delhi to Mathura</a></li>
        </ul>
      </div>
      <div className="footer-column">
        <h4>&nbsp;</h4>
        <p>Courier services</p>
        <ul>
          <li><a href="#courier-del">Courier services New Delhi</a></li>
          <li><a href="#courier-mum">Courier services Mumbai</a></li>
          <li><a href="#courier-hyd">Courier services Hyderabad</a></li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <p>© 2025 AIL Cabs | All mockups are for demonstration purposes only.</p>
    </div>
  </footer>
);

// ===================================================================
//  3. FINAL APP LAYOUT
// ===================================================================

function App() {
  // State to hold the result of the prediction/booking
  const [predictionResult, setPredictionResult] = useState({
    predictedTime: null,
    predictedFare: null,
    availability: null,
    confidence: null,
    ridesLast3Days: null,
    ridesLastWeek: null,
    alternativeSuggestion: null,
    route: null,
    pickup: null,
    dropoff: null,
  });

  return (
    <>
      <DarkVeil 
        speed={0.3} 
        noiseIntensity={0.03}
        scanlineIntensity={0.05}
        warpAmount={0.5}
        hueShift={10}
        scanlineFrequency={200}
      />

      <div className="main-container">
        <Header />
        <main>
          {/* Map is now INSIDE HeroSection */}
          <HeroSection 
            setPredictionResult={setPredictionResult}
            predictionResult={predictionResult}
          />
          <SuggestionsSection />
          <FriendsPromoSection />
          {/* Map section removed from here */}
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;