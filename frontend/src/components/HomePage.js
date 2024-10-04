import React from 'react';
import { Link } from 'react-router-dom';
import { FaCloudUploadAlt, FaFileAlt, FaRobot, FaCog, FaArrowRight } from 'react-icons/fa';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Welcome to AFWI MAGE FineTune</h1>
        <p className="home-description">
          Streamline your document processing and fine-tuning workflow with our advanced AI-powered platform. 
          From upload to deployment, we guide you through every step of creating your custom language model.
        </p>
        
        <div className="feature-grid">
          <div className="feature-card">
            <FaCloudUploadAlt className="feature-icon" />
            <h2 className="feature-title">Upload</h2>
            <p className="feature-description">Upload your documents in various formats including PDF, DOCX, and TXT.</p>
          </div>
          <FaArrowRight className="process-arrow" />
          <div className="feature-card">
            <FaFileAlt className="feature-icon" />
            <h2 className="feature-title">Extract</h2>
            <p className="feature-description">Automatically extract relevant content from your documents using AI.</p>
          </div>
          <FaArrowRight className="process-arrow" />
          <div className="feature-card">
            <FaRobot className="feature-icon" />
            <h2 className="feature-title">Generate</h2>
            <p className="feature-description">Use AI to generate a comprehensive training dataset based on extracted content.</p>
          </div>
          <FaArrowRight className="process-arrow" />
          <div className="feature-card">
            <FaCog className="feature-icon" />
            <h2 className="feature-title">Fine-Tune</h2>
            <p className="feature-description">Prepare and initiate the fine-tuning process for your custom LLM.</p>
          </div>
          <FaArrowRight className="process-arrow" />
          <div className="feature-card">
            <FaRobot className="feature-icon" />
            <h2 className="feature-title">Test</h2>
            <p className="feature-description">Interact with your fine-tuned model to test its performance and capabilities.</p>
          </div>
        </div>

        <Link to="/upload" className="get-started-button">
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default HomePage;