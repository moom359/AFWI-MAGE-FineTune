import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './components/HomePage';
import UploadComponent from './components/UploadComponent';
import ExtractComponent from './components/ExtractComponent';
import GenerateDataset from './components/GenerateDataset';
import FineTune from './components/FineTune';
import Test from './components/Test';
import './App.css';
import LLMInteraction from './components/LLMInteraction';

function App() {
  return (
    <Router>
      <div className="App animated-gradient">
        <Header />
        <main>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/upload" component={UploadComponent} />
            <Route path="/extract" component={ExtractComponent} />
            <Route path="/generate" component={GenerateDataset} />
            <Route path="/fine-tune" component={FineTune} />
            <Route path="/test" component={Test} />
            {/* Comment out or remove the line below to disable the route */}
            {/* <Route path="/llm-interaction" component={LLMInteraction} /> */}
          </Switch>
        </main>
        <footer className="app-footer">
          This application was developed and maintained by the Air Force Wargaming Institute
        </footer>
      </div>
    </Router>
  );
}

export default App;