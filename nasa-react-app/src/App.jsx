import { useEffect, useState } from 'react'

import Main from './component/Main.jsx';
import Footer from './component/Footer.jsx';
import SideBar from './component/SideBar.jsx';

import './App.css'

import RoverImages from './component/Rover-images.jsx';

function App() {
  const NASA_KEY = import.meta.env.VITE_NASA_API_KEY;
  const [showModal, setShowModal] = useState(false);
  const [nasaData, setNasaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleDateChange = (e) => {
    setDate(e.target.value);
  }
  
  function handleToggleModal() {
    setShowModal(!showModal);
  }

  useEffect(() => {
    async function fetchAPIData(){
      const apodurl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&date=${date}`;
      
      try {
        const response = await fetch(apodurl);
        const apidata = await response.json();
        setNasaData(apidata);
        console.log('DATA\n', apidata);
      } catch (error) {
        console.log(error.message);
      }
    }
    
    fetchAPIData();
  },[date]);

  return (
    <div className='App'>
      <div className="main-content">
        {nasaData ? (
          <Main nasaData={nasaData} handleDateChange={handleDateChange} />
        ) : (
          <div className='loadingState'><i className='fa-solid fa-gear'></i></div>
        )}

        {showModal && <SideBar data={nasaData} handleToggleModal={handleToggleModal} />}

        {nasaData && <Footer handleToggleModal={handleToggleModal} data={nasaData} />}
      </div>

      <div className="rover-section">
        <RoverImages />
      </div>
    </div>
  );
}

export default App


