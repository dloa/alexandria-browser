var events = require('events')

function State (initialState) {
	this.state = initialState

	events.EventEmitter.call(this)
}

State.prototype.setState = function (state) {
	this.state = state
	this.emit('change', state)
};

State.prototype.getState = function() {
	return this.state
}

exports = module.exports = State;
