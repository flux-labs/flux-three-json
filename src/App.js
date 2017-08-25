import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import * as THREE from 'three';
import FluxViewport from 'flux-viewport/dist/flux-viewport.common.js';
import Button from './Button';
import * as helpers from './util/helpers.js';
import Dropdown from './Dropdown';

const config = {
  url: window.location.href,
  flux_url: 'https://flux.io', // flux url
  flux_client_id: 'b99a9013-2742-4900-b52d-21ceb4b0b920' // your app's client id
}
const sphere = {"origin":[0,0,0],"primitive":"sphere","radius":5};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      projects: [],
      keys: [],
      data: JSON.stringify(sphere),
      image: ''
    };
    this.projectMap = {};
    this.keyMap = {};
    helpers.init(config).then((loggedIn) => {
      this.setState({loggedIn: loggedIn});
      if (loggedIn) {
        helpers.getProjects().then((projects)=>{
          this.projectMap = {};
          for (let i=0;i<projects.entities.length;i++) {
            this.projectMap[projects.entities[i].id] = projects.entities[i];
          }
          this.setState({
            projects: projects.entities
          });
        });
      }
    });
  }

  setViewport(div)
  {
    if (div == null || this.viewportDiv != null) return;
    this.viewportDiv = div;
    console.log("VP set");
    this.vp = new FluxViewport(div);
    var sphere = JSON.parse(this.state.data);
    this.vp.setGeometryEntity(sphere);
  }

  updateViewport(json) {
    var data = json;
    if (!FluxViewport.isKnownGeom(json)) {
      data = sphere;
    }
    this.vp.setGeometryEntity(data).then((result)=>{
      this.vp.focus();
    });
  }
  _onLogin() {
      // don't need to updste state since page changes and state will refresh on load
      helpers.login();
  }

  _onLogout() {
      helpers.logout();
      this.setState({loggedIn: false});
  }

  _selectProject(sel) {
    this.project = this.projectMap[sel.value];
    helpers.getCells(this.project).then((cells)=>{
      this.keyMap = {};
      for (let i=0;i<cells.entities.length;i++) {
        this.keyMap[cells.entities[i].id] = cells.entities[i];
      }
      this.setState({
        keys: cells.entities.map((cell)=>{cell.name=cell.label; return cell;})
      });
    });
  }

  _stashValue() {
    if (this.value == null || this.value.constructor != Array) return;
    this.entityMap = {};
    for (let i=0;i<this.value.length;i++) {
      var value = this.value[i];
      if (value == null || value.id == null) continue;
      this.entityMap[value.id] = value;
    }
  }

  _keyChange(sel){
    this.key = this.keyMap[sel.value];
    this.setState({
      "data": "Loading..."
    });
    helpers.getValue(this.project, this.key).then((cell)=>{
      this.value = cell.value;
      this.updateViewport(this.value);
      this.setState({
        "data": JSON.stringify(this.value)
      });
    });
  }

  _getOptions() {
    if (this.state.loggedIn) {
      return (<div className="options">
        <Button label="Logout" callback={()=>{this._onLogout()}}></Button>
        <Dropdown hint="select project" callback={(e)=>{this._selectProject(e.currentTarget)}} items={this.state.projects}></Dropdown>
        <Dropdown hint="select key" callback={(e)=>{this._keyChange(e.currentTarget)}} items={this.state.keys}></Dropdown>
      </div>);
    } else {
      return (
        <div className="options">
          <Button label="Login" callback={()=>{this._onLogin()}}></Button>
        </div>);
    }
  }

  // Function to update react state to match what is in the text box
  // Prevents clobbering of user input by react
  _handleDataChange(e) {
    this.setState({data: e.target.value});
  }

  render() {
    return (
      <div className="App">
          {this._getOptions()}
          <div className="content">
            <textarea id="data" className="fields" type="text" onChange={(e)=>{this._handleDataChange(e)}} value={this.state.data} ref={(area)=>{this._comment = area;}} name="Data"></textarea><br/>
            <div className="viewport" ref={this.setViewport.bind(this)}></div>
          </div>

      </div>
    );
  }
}

export default App;
