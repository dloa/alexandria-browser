import React from 'react/addons';
import Router from 'react-router';
import hub from '../utils/HubUtil';

var Preferences = React.createClass({
  mixins: [Router.Navigation],
 
  render: function () {
    return (
      <div className="content-scroller" id="content">
        <section>
                <h1 className="title">General</h1>

              
        </section>
      </div>
    );
  }
});

module.exports = Preferences;
