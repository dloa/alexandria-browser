import React from 'react/addons';
import Router from 'react-router';
import RetinaImage from 'react-retina-image';

var Sidebar = React.createClass({
  componentWillMount: function () {
    this.start = Date.now();
  },
  render: function () {
    return (
      <ul className="sidebar">
        <Router.Link to="dashboard">
          <li>
            <RetinaImage src="icons/someawesomeicon"/>
            <p>dashboard</p>
          </li>
        </Router.Link>
        <Router.Link to="preferences">
          <li>
            <RetinaImage src="icons/someawesomeicon"/>
            <p>preferences</p>
          </li>
        </Router.Link>
      </ul>
    );
  }
});

module.exports = Sidebar;
