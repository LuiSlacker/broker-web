/**
 * de.sb.broker.ClosedAuctionsController: broker closed auctions controller.
 * 
 */
"use strict";

this.de = this.de || {};
this.de.sb = this.de.sb || {};
this.de.sb.broker = this.de.sb.broker || {};
(function () {
	var SUPER = de.sb.broker.Controller;

	/**
	 * Creates a new closedAuctions controller that is derived from an abstract controller.
	 * @param sessionContext {de.sb.broker.SessionContext} a session context
	 */
	de.sb.broker.ClosedAuctionsController = function (sessionContext) {
		SUPER.call(this, 2, sessionContext);
	}
	de.sb.broker.ClosedAuctionsController.prototype = Object.create(SUPER.prototype);
	de.sb.broker.ClosedAuctionsController.prototype.constructor = de.sb.broker.ClosedAuctionsController;


	/**
	 * Displays the associated view.
	 */
	de.sb.broker.ClosedAuctionsController.prototype.display = function () {
		if (!this.sessionContext.user) return;
		SUPER.prototype.display.call(this);
		this.displayStatus(200, "OK");

		var closedAuctionElement = document.querySelector("#closed-seller-auctions-template").content.cloneNode(true).firstElementChild;
		var bidsInClosedAuctionsElement = document.querySelector("#closed-bidder-auctions-template").content.cloneNode(true).firstElementChild;
		document.querySelector("main").appendChild(closedAuctionElement);
		document.querySelector("main").appendChild(bidsInClosedAuctionsElement);
		
		this.displayClosedAuctions();
	}


	/**
	 * Displays the closed auctions of the user.
	 */
	de.sb.broker.ClosedAuctionsController.prototype.displayClosedAuctions = function () {
		var self = this;
		var user = this.sessionContext.user;
		de.sb.util.AJAX.invoke("/services/auctions/?closuretimeUpper=" + Date.now(), "GET", {"Accept": "application/json"}, null, user, function (request) {
			self.displayStatus(request.status, request.statusText);
			if (request.status === 200) {
				var auctions = JSON.parse(request.responseText);
				console.log(auctions);
				auctions.forEach(function(auction, index){
					var tableRowElement = document.querySelector("#table-row").content.querySelector('tr').cloneNode(true);
					var tableCells = tableRowElement.querySelectorAll('td');
					tableCells[0].innerHTML = auction.closed;
					tableCells[1].innerHTML = new Date(auction.creationTimestamp);
					tableCells[2].innerHTML = new Date(auction.closureTimestamp);
					tableCells[3].innerHTML = auction.title;
					tableCells[4].innerHTML = auction.unitCount;
					tableCells[5].innerHTML = de.sb.broker.ClosedAuctionsController.prototype.prettyPrice(auction.askingPrice);
					tableCells[6].innerHTML = "";
					document.querySelector("section.closed-seller-auctions tbody").appendChild(tableRowElement);
				});
			}
		});	
	}
	
	/**
	 * Displays the closed auctions of the user.
	 */
	de.sb.broker.ClosedAuctionsController.prototype.displayBidsInClosedAuctions = function () {
		var self = this;
		var user = this.sessionContext.user;
		de.sb.util.AJAX.invoke("/services/auctions/?closuretimeUpper=" + Date.now(), "GET", {"Accept": "application/json"}, null, user, function (request) {
			self.displayStatus(request.status, request.statusText);
			if (request.status === 200) {
				var auctions = JSON.parse(request.responseText);
				console.log(auctions);
				auctions.forEach(function(auction, index){
					var tableRowElement = document.querySelector("#table-row").content.querySelector('tr').cloneNode(true);
					var tableCells = tableRowElement.querySelectorAll('td');
					tableCells[0].innerHTML = auction.closed;
					tableCells[1].innerHTML = new Date(auction.creationTimestamp);
					tableCells[2].innerHTML = new Date(auction.closureTimestamp);
					tableCells[3].innerHTML = auction.title;
					tableCells[4].innerHTML = auction.unitCount;
					var cents = (auction.askingPrice % 100);
					var cents = (cents.toString().length == 1) ? "0"+ (auction.askingPrice % 100): (auction.askingPrice % 100);
					tableCells[5].innerHTML = auction.askingPrice / 100 + "." + cents;
					tableCells[6].innerHTML = "";
					document.querySelector("section.closed-seller-auctions tbody").appendChild(tableRowElement);
				});
			}
		});	
	}
} ());