import _ from 'lodash';
import React from 'react';
import Router from 'react-router';
import Sidebar from './Sidebar.react';
import RetinaImage from 'react-retina-image';

var Client = React.createClass({
  render: function () {
    return (
      <div>
        <div className="content-container">
          <Sidebar />
          <Router.RouteHandler />
        </div>
      </div>
    );
  }
});

module.exports = Client;
