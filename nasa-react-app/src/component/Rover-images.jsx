import { useEffect, useState } from 'react';
import Opportunity from './Opportunity.jpg';
import Curiosity from './Curiosity.jpg';
import Spirit from './Spirit.jpg';
import Perseverance from './Perseverance.jpg';
import './Rover-images.css';

// Default rover image for rovers without specific images
const defaultRoverImage = 'https://mars.nasa.gov/system/resources/detail_files/25889_Sojourner_on_Mars_PIA00994-web.jpg';

const roverImages = {
  Curiosity: Curiosity,
  Opportunity: Opportunity,
  Spirit: Spirit,
  Perseverance: Perseverance,
};

// Rover service periods
const roverServicePeriods = {
  curiosity: { start: '2012-08-06', end: new Date().toISOString().split('T')[0] },
  opportunity: { start: '2004-01-25', end: '2018-06-10' },
  spirit: { start: '2004-01-04', end: '2010-03-21' },
  perseverance: { start: '2021-02-18', end: new Date().toISOString().split('T')[0] },
};

// Default dates with known images for each rover
const defaultDates = {
  curiosity: '2015-06-15',
  opportunity: '2004-01-25',
  spirit: '2004-01-04',
  perseverance: '2021-02-18',
};

// Rover descriptions
const roverDescriptions = {
  curiosity: {
    name: "Curiosity",
    status: "Active",
    mission: "Mars Science Laboratory",
    description: "Launched in 2011, Curiosity is a car-sized rover exploring Gale Crater. It's investigating Mars' climate and geology, assessing whether the selected field site inside Gale Crater has ever offered environmental conditions favorable for microbial life.",
    achievements: "Discovered evidence of ancient lakes and streams, detected organic molecules, and measured radiation levels on Mars."
  },
  opportunity: {
    name: "Opportunity",
    status: "Retired (2018)",
    mission: "Mars Exploration Rover",
    description: "Launched in 2003, Opportunity was designed to last 90 days but operated for over 14 years. It explored the Meridiani Planum region, finding evidence of ancient water activity.",
    achievements: "Traveled over 45 kilometers, discovered evidence of ancient water, and set the off-world driving record."
  },
  spirit: {
    name: "Spirit",
    status: "Retired (2010)",
    mission: "Mars Exploration Rover",
    description: "Launched in 2003, Spirit explored Gusev Crater for over 6 years. It was designed to last 90 days but far exceeded its expected lifetime.",
    achievements: "Discovered evidence of ancient hot springs, found silica deposits indicating past water activity, and climbed the Columbia Hills."
  },
  perseverance: {
    name: "Perseverance",
    status: "Active",
    mission: "Mars 2020",
    description: "Launched in 2020, Perseverance is exploring Jezero Crater. It's searching for signs of ancient life and collecting samples for future return to Earth.",
    achievements: "First powered flight on another planet with Ingenuity helicopter, collecting samples for future return, and testing oxygen production from Mars' atmosphere."
  },
};

function RoverImages() {
  const NASA_KEY = import.meta.env.VITE_NASA_API_KEY;
  const [selectedRover, setSelectedRover] = useState('curiosity');
  const [selectedEarthDate, setSelectedEarthDate] = useState(defaultDates.curiosity);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImageData, setSelectedImageData] = useState(null);

  // Function to find nearest date with images
  const findNearestDateWithImages = async (rover, startDate) => {
    setLoading(true);
    let currentDate = new Date(startDate);
    const endDate = new Date(roverServicePeriods[rover].end);
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts && currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      try {
        const response = await fetch(
          `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?api_key=${NASA_KEY}&earth_date=${dateStr}`
        );
        const data = await response.json();
        
        if (data.photos && data.photos.length > 0) {
          setLoading(false);
          return dateStr;
        }
      } catch (err) {
        console.error('Error checking date:', err);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
      attempts++;
    }

    setLoading(false);
    return defaultDates[rover];
  };

  useEffect(() => {
    const fetchRoverImages = async () => {
      setLoading(true);
      setError(null);
      // Check if the rover is supported by NASA's API
      const nasaSupportedRovers = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
      if (!nasaSupportedRovers.includes(selectedRover)) {
        setImages([]);
        setError(`Images for ${selectedRover} are not available through NASA's API.`);
        setSelectedImageData(null);
        setLoading(false);
        return;
      }
      let apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${selectedRover}/photos?api_key=${NASA_KEY}&earth_date=${selectedEarthDate}`;
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          const seen = new Set();
          const uniqueImages = data.photos.filter(photo => {
            const duplicate = seen.has(photo.id);
            seen.add(photo.id);
            return !duplicate;
          });
          setImages(uniqueImages);
          setSelectedImageData(uniqueImages[0]); // Always set to first image when images change
        } else {
          const newDate = await findNearestDateWithImages(selectedRover, selectedEarthDate);
          setSelectedEarthDate(newDate);
          setSelectedImageData(null);
        }
      } catch (err) {
        setError(err.message);
        setSelectedImageData(null);
      }
      setLoading(false);
    };
    fetchRoverImages();
  }, [selectedRover, selectedEarthDate, NASA_KEY]);

  const handleDateChange = (e) => {
    setSelectedEarthDate(e.target.value);
  };

  const handleRoverSelect = async (rover) => {
    setSelectedRover(rover);
    setSelectedEarthDate(defaultDates[rover]);
  };

  const handleImageClick = (imageData) => {
    setSelectedImageData(imageData);
  };

  const getRoverInfo = () => {
    const rover = roverServicePeriods[selectedRover];
    return `Service Period: ${rover.start} to ${rover.end}`;
  };

  return (
    <div className="rover-layout">
      <div className="rover-images-grid">
        {loading && <p className="loading-text">Loading images...</p>}
        {error && (
          <div className="error-message">
            <p className="error-text">{error}</p>
            {error.includes('not available') && (
              <div className="rover-info-fallback">
                <h3>{roverDescriptions[selectedRover].name}</h3>
                <p>{roverDescriptions[selectedRover].description}</p>
                <div className="rover-achievements">
                  <strong>Key Achievements:</strong>
                  <p>{roverDescriptions[selectedRover].achievements}</p>
                </div>
              </div>
            )}
          </div>
        )}
        {!loading && !error && images.length === 0 && (
          <div className="no-images-message">
            <p>No images available for the selected date.</p>
            <p>{getRoverInfo()}</p>
          </div>
        )}
        <div className="masonry-layout">
          {images.map((img) => (
            <div key={img.id} className="masonry-item" onClick={() => handleImageClick(img)}>
              <img src={img.img_src} alt={`Mars Rover Image ${img.id} by ${img.camera.full_name}`} />
            </div>
          ))}
        </div>

        {/* Rover Description Section - Moved under images */}
        <div className="rover-description-section">
          <h3>{roverDescriptions[selectedRover].name}</h3>
          <div className="rover-status">
            <span className={`status-indicator ${roverDescriptions[selectedRover].status.toLowerCase().includes('active') ? 'active' : 'retired'}`}>
              {roverDescriptions[selectedRover].status}
            </span>
          </div>
          <div className="rover-mission">
            <strong>Mission:</strong> {roverDescriptions[selectedRover].mission}
          </div>
          <div className="rover-details">
            <p>{roverDescriptions[selectedRover].description}</p>
            <div className="rover-achievements">
              <strong>Key Achievements:</strong>
              <p>{roverDescriptions[selectedRover].achievements}</p>
            </div>
          </div>
        </div>
      </div>

      <aside className="rover-sidebar">
        <h2 className="mars-title">Mars-Rover Images</h2>
        <div className="rover-selector">
          {['curiosity', 'opportunity', 'spirit', 'perseverance'].map((rover) => (
            <button
              key={rover}
              className={`rover-circle${selectedRover === rover ? ' selected' : ''}`}
              onClick={() => handleRoverSelect(rover)}
              aria-label={rover.charAt(0).toUpperCase() + rover.slice(1)}
            >
              <img
                src={roverImages[rover.charAt(0).toUpperCase() + rover.slice(1)]}
                alt={rover.charAt(0).toUpperCase() + rover.slice(1)}
              />
              <span className="rover-tooltip">{roverDescriptions[rover].name}</span>
            </button>
          ))}
        </div>

        <div className="mars-info">
          <span className="mars-label">Earth Date</span>
          <input
            type="date"
            value={selectedEarthDate}
            onChange={handleDateChange}
            min={roverServicePeriods[selectedRover].start}
            max={roverServicePeriods[selectedRover].end}
          />
        </div>

        <div className="mars-info">
          <span className="mars-label">Camera</span>
          <span className="mars-value">{selectedImageData ? selectedImageData.camera.full_name : '-'}</span>
        </div>

        <div className="mars-description">
          {selectedImageData ? (
            <>
              <strong>Description:</strong> Martian landscape captured by {selectedImageData.rover.name}'s {selectedImageData.camera.name} camera.
            </>
          ) : (
            <span>No image selected.</span>
          )}
        </div>

        <div className="date-navigation">
          <span style={{ display: "flex", alignItems: "center", gap: "10px", color: "#ccc" }}>
            <i className="fa-regular fa-calendar" style={{ fontSize: "1.2rem" }}></i>
            {selectedEarthDate ? new Date(selectedEarthDate).toLocaleDateString() : 'mm/dd/yyyy'}
          </span>
        </div>
      </aside>
    </div>
  );
}

export default RoverImages;
