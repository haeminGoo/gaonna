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
    <Router basename={process.env.PUBLIC_URL}>
      <Switch>
          <Route exact path={`/:name`} component={Data}/>
          <Route exact path={`/`} component={Data}/>
        </Switch>
    </Router>
  );
}
