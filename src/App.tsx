// src/App.tsx

import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import './App.css';
import env from "react-dotenv";


const App: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [plantName, setPlantName] = useState<string | null>(null);
  const [plantImage, setPlantImage] = useState<string | null>(null);

  const captureAndIdentifyPlant = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const plant = await getPlantNameFromPhoto(imageSrc);
      setPlantName(plant.suggestions[0].plant_name);
      setPlantImage(plant.images[0].url)
    }
  };

  return (
      <div className="App">
        <h1>Plant Identifier</h1>
        <div className="WebcamContainer">
          <Webcam
              audio={false}
              reversed
              videoConstraints={{facingMode: "environment"}}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="Webcam"
          />
        </div>
        <button className="CaptureButton" onClick={captureAndIdentifyPlant}>
          Сфотографувати і знайти рослину 
        </button>
        {plantImage && <img alt="plant" className="plant-image" src={plantImage}/>}
        {plantName && <div className="PlantResult">Назва рослини: {plantName}</div>}
        {plantName && <p>Стаття про рослину:</p>}
        {plantName && <iframe width="100%" height="500vh" title={plantName ?? ''} src={`https://uk.m.wikipedia.org/wiki/${plantName.split(" ")[0]}`}/>}
      </div>
  );
};

async function getPlantNameFromPhoto(imageBase64: string): Promise<any> {
  const apiKey : string = env.REACT_APP_PLANT_ID_KEY;
  const apiUrl = 'https://api.plant.id/v2/identify';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify({
        organs: ['leaf', 'flower', 'fruit'],
        org_parts: ['flower', 'leaf'],
        images: [imageBase64],
      }),
    });

    const data = await response.json();
    if (data && data.suggestions && data.suggestions.length > 0) {
      const plant = data;
      return plant;
    }
  } catch (error) {
    console.error('Error fetching plant data:', error);
  }

  return null;
}

export default App;
