import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import HomeComponent from './components/HomeComponent';
import UploadComponent from './components/UploadComponent';
import ExtractComponent from './components/ExtractComponent';
import ReviewComponent from './components/ReviewComponent';
import FineTune from './components/FineTune';
import Test from './components/Test';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Switch>
            <Route exact path="/" component={HomeComponent} />
            <Route path="/upload" component={UploadComponent} />
            <Route path="/extract" component={ExtractComponent} />
            <Route path="/review" component={ReviewComponent} />
            <Route path="/fine-tune" component={FineTune} />
            <Route path="/test" component={Test} />
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;