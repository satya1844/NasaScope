import React from 'react'
import image from './Crab_Hubble.jpg';

function Main(props) {
  const { nasaData, handleDateChange } = props;
  return (
    <>
      <div className='imgContainer'>
        <img src={nasaData?.hdurl} alt={nasaData?.title || 'bg-image'} className='bgImage'/>
        <div className="bgGradient"></div>
        <input className='dateSelector' type='date' id='date' onChange={handleDateChange} />
      </div>
    </>
  )
}

export default Main