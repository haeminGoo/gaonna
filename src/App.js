import './App.css';
import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import 'antd/dist/antd.css'
import Data from './Pages/Data'

export default function App() {
  return (
    <Router>
      <Switch>
          <Route exact path="/gaonna/:name" component={Data}/>
        </Switch>
    </Router>
  );
}
