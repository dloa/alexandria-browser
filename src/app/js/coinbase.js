var buyWidgetSettings = {
	code: '169c6c3a-d404-55f4-82f4-24cd25f5c5f6',
	currency: 'USD',
	crypto_currency: 'BTC',
	state: 123,
	play_generated: false,
	dl_generated: false
}
// Default create the coinbase modal
createCoinbaseModal('', 0);

// Recieve message if purchase failed or succeeded. 
function receiveMessage(event) {
	console.log("Recieved Event:" + event);
	// Only trust Coinbase with messages
	if (event.origin !== "https://buy.coinbase.com")
		return;
	console.log("Coinbase Response:" + event.data);
}
function fillCoinbaseBuyWidget(bitcoinAddress, amount){
	if ($("#coinbase_widget") == null)
		updateCoinbaseModal(bitcoinAddress, amount);
}
function testDomain(){
	if(window.location.hostname != "alexandria.io" && location.hostname != "localhost"){
		console.log("Not on supported domains, remove Coinbase button.");
		$('#coinbase_widget_play').remove();
		$('#coinbase_widget_download').remove();
		$('#coinbase_button_iframe').remove();
	}
}

// Code taken from: https://buy.coinbase.com/static/widget.js
// Needs comments, just a base function pulled directly out of their application with a few modifications to make it work in a function.
function createCoinbaseModal(bitcoinAddress, amount, action) {
	if (action != 'play' && action != 'download')
		return;

	// Check if modal exists and redirect
	if ((action == 'play' && buyWidgetSettings.play_generated) || (action == 'download' && buyWidgetSettings.dl_generated)){
		console.log("Modal already exists, reroute");
		updateCoinbaseModal(bitcoinAddress, amount);
		return;
	}
	// Coinbase enforces a minimum $1 transaction
	if (amount < 1)
		amount = 1;

	var a = function i(){
		var n = $("#coinbase_widget_" + action);
		console.log(n);
		var tmp = this;
		this.init = function() {
			n.domain = "https://buy.coinbase.com", 
			n.link = $("#coinbase_widget_" + action), 
			n.button = tmp.generateIframe(tmp.buttonIframe()), 
			n.link.parent().append(n.button), 
			n.modal = tmp.generateIframe(tmp.modalIframe()), 
			document.body.appendChild(n.modal), 
			n.link.onclick = function(e) {
				e.preventDefault(), $('#coinbase_modal_iframe').style.display = "block"
			}, window.addEventListener("message", tmp.handleMessage, !1)
		}, this.generateIframe = function(n) {
			var e = document.createElement("div");
			return e.innerHTML = n, e.firstChild
		}, this.generateParams = function(n) {
			return "?address=" + encodeURIComponent(bitcoinAddress) + ("&amount=" + encodeURIComponent(amount)) + ("&code=" + encodeURIComponent(buyWidgetSettings.code)) + ("&currency=" + encodeURIComponent(buyWidgetSettings.currency)) + ("&crypto_currency=" + encodeURIComponent(buyWidgetSettings.crypto_currency)) + ("&state=" + encodeURIComponent(buyWidgetSettings.state))
		}, this.modalIframeStyle = function() {
			return "\n      transition: all 0.3s ease-out;\n      background-color: transparent;\n      border: 0px none transparent;\n      display: none;\n      position: fixed;\n      visibility: visible;\n      margin: 0px;\n      padding: 0px;\n      left: 0px;\n      top: 0px;\n      width: 100%;\n      height: 100%;\n      z-index: 9999;\n    "
		}, this.modalIframe = function() {
			// remove all iframes in existance
			$('#coinbase_modal_iframe').remove();
			// Continue on with normal code
			var e = tmp.generateParams('asdf');
			return "<iframe class='coinbase_modal_iframe' src='" + n.domain + "/" + e + "'\n                    id='coinbase_modal_iframe'\n                    name='coinbase_modal_iframe'\n                    style='" + tmp.modalIframeStyle() + "'\n                    scrolling='no'\n                    allowtransparency='true' frameborder='0'>\n      </iframe>"
		}, this.buttonIframeStyle = function() {
			return "\n      width: 273px;\n      height: 53px;\n      border: none;\n      overflow: hidden;\n      display: none;\n      border-radius: 5px;\n    "
		}, this.buttonParams = function(n) {
			return "?crypto_currency=" + encodeURIComponent(buyWidgetSettings.crypto_currency)
		}, this.buttonIframe = function() {
			console.log(n);
			var e = tmp.buttonParams('asdf');
			return "<iframe src='" + n.domain + "/button" + e + "'\n                    id='coinbase_button_iframe'\n                    class='coinbase_button_iframe'\n                    name='coinbase_button_iframe'\n                    style='" + tmp.buttonIframeStyle() + "'\n                    scrolling='no'\n                    allowtransparency='true'\n                    frameborder='0'>\n      </iframe>"
		}, this.handleMessage = function(e) {
			switch (e.data.event) {
				case "modal_closed":
					$('#coinbase_modal_iframe').css('display', 'none'), $('#coinbase_modal_iframe').src = $('#coinbase_modal_iframe').src;
					break;
				case "button_loaded":
					$('#coinbase_widget_' + action).css('display', 'none');
					$('#coinbase_button_iframe').css('display', 'block');
					if (action == 'play')
						buyWidgetSettings.play_generated = true;
					else if (action == 'download')
						buyWidgetSettings.dl_generated = true;
					break;
				case "button_clicked":
					$('#coinbase_modal_iframe').css('display', 'block');
					break;
			}
		}
	}
	var r = new a;
	r.init();
}

function updateCoinbaseModal(bitcoinAddress, amount){
	$('#coinbase_widget_download').css('display', 'none');
	$('#coinbase_widget_play').css('display', 'none');
	$('.coinbase_button_iframe').css('display', 'block');
	// Coinbase enforces a minimum $1 transaction
	if (amount < 1)
		amount = 1;
	// Remove the old modal
	$('#coinbase_modal_iframe').remove();
	// Create a new modal
	var e = document.createElement("div");
	// Fill in all the modal HTML
	e.innerHTML = "<iframe class='coinbase_modal_iframe' src='https://buy.coinbase.com?address=" + encodeURIComponent(bitcoinAddress) + ("&amount=" + encodeURIComponent(amount)) + ("&code=" + encodeURIComponent(buyWidgetSettings.code)) + ("&currency=" + encodeURIComponent(buyWidgetSettings.currency)) + ("&crypto_currency=" + encodeURIComponent(buyWidgetSettings.crypto_currency)) + ("&state=" + encodeURIComponent(buyWidgetSettings.state)) + "'\n                    id='coinbase_modal_iframe'\n                    name='coinbase_modal_iframe'\n                    style='" + "\n      transition: all 0.3s ease-out;\n      background-color: transparent;\n      border: 0px none transparent;\n      display: none;\n      position: fixed;\n      visibility: visible;\n      margin: 0px;\n      padding: 0px;\n      left: 0px;\n      top: 0px;\n      width: 100%;\n      height: 100%;\n      z-index: 9999;\n    " + "'\n                    scrolling='no'\n                    allowtransparency='true' frameborder='0'>\n      </iframe>";
	// Add the modal to the end of the page. We do not include the div by using "e.firstChild"
	document.body.appendChild(e.firstChild);
}

function hideCoinbaseButton(){
	$('#coinbase_widget_download').css('display', 'none');
	$('#coinbase_widget_play').css('display', 'none');
	$('#coinbase_modal_iframe').css('display', 'none');
	$('#coinbase_button_iframe').css('display', 'none');
}