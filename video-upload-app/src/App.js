import { useState } from "react";
import axios from "axios";
import "./Style.css"
function App() {
  const [video, setVideo] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("video", video);

    try {
      const response = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMetadata(response.data.metadata);
    } catch (error) {
      console.error("Error uploading video", error);
    }
  };

  return (
    <div className="App">
      <h1>Video Upload and Metadata Extraction</h1>
      <input type="file" accept="video/*" onChange={handleVideoChange} />
      <button onClick={handleUpload}>Upload Video</button>

      {metadata && (
        <div>
          <h2>Metadata:</h2>
          <p>
            <strong>Filename:</strong> {metadata.filename}
          </p>
          <p>
            <strong>Duration:</strong> {metadata.duration} seconds
          </p>
          <p>
            <strong>Resolution:</strong> {metadata.resolution}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
