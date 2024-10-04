import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/afwi_logo.png'; // Make sure to add your logo to the assets folder
import HomeIcon from '@material-ui/icons/Home';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import ExtractIcon from '@material-ui/icons/Description';
import RateReviewIcon from '@material-ui/icons/RateReview';
import TuneIcon from '@material-ui/icons/Tune';
import AssessmentIcon from '@material-ui/icons/Assessment';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

function Header() {
  return (
    <header className="app-header">
      <div className="logo-title-container">
        <img src={logo} alt="AFWI Logo" className="logo" />
        <div className="title-container">
          <h1>Air Force Wargaming Institute</h1>
          <h2>MAGE LLM Fine-Tuning Utility</h2>
        </div>
      </div>
      <nav className="workflow-nav">
        <ul>
          <li><Link to="/"><HomeIcon /> Home</Link></li>
          <li className="workflow-step">
            <Link to="/upload"><CloudUploadIcon /> Upload</Link>
            <ArrowForwardIcon className="arrow" />
          </li>
          <li className="workflow-step">
            <Link to="/extract"><ExtractIcon /> Extract</Link>
            <ArrowForwardIcon className="arrow" />
          </li>
          <li className="workflow-step">
            <Link to="/review"><RateReviewIcon /> Review</Link>
            <ArrowForwardIcon className="arrow" />
          </li>
          <li className="workflow-step">
            <Link to="/fine-tune"><TuneIcon /> Fine-Tune</Link>
            <ArrowForwardIcon className="arrow" />
          </li>
          <li className="workflow-step">
            <Link to="/test"><AssessmentIcon /> Test</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;