import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import kvkData from './kvk.json'; // Import the JSON file

function Kvk() {
  const mapContainerStyle = {
    height: '100vh',
    width: '100%',
  };

  const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Default map center (India)

  const [map, setMap] = useState(null); // State to store the map instance

  // Function to add red pins for KVK centers
  const addMarkers = (map) => {
    kvkData.forEach((center) => {
      new window.google.maps.Marker({
        position: { lat: parseFloat(center.lat), lng: parseFloat(center.lng) }, // Ensure lat and lng are numbers
        map: map,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // Red pin
        },
      });
    });
  };

  // Effect to load the map and add markers
  useEffect(() => {
    if (map) {
      addMarkers(map);
    }
  }, [map]);

  return (
    <div>
      <LoadScript googleMapsApiKey="AIzaSyB0bZe9cerd-8CCehPYokzNlhZ4LX4wivc">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={5}
          center={defaultCenter}
          onLoad={(map) => setMap(map)} // Set map instance on load
        />
      </LoadScript>
    </div>
  );
}

export default Kvk;
