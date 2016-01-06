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

		var sectionElement = document.querySelector("#closed-seller-auctions-template").content.cloneNode(true).firstElementChild;
		var sectionElement1 = document.querySelector("#closed-bidder-auctions-template").content.cloneNode(true).firstElementChild;
		document.querySelector("main").appendChild(sectionElement);
		document.querySelector("main").appendChild(sectionElement1);
		
		this.displayClosedAuctions();
	}


	/**
	 * Displays the closed auctions of the user.
	 */
	de.sb.broker.ClosedAuctionsController.prototype.displayClosedAuctions = function () {
		var self = this;
		var user = this.sessionContext.user;
		de.sb.util.AJAX.invoke("/services/auctions?closuretimeUpper=" + Date.now(), "GET", {"Accept": "application/json"}, user, function (request) {
			self.displayStatus(request.status, request.statusText);
			if (request.status === 200) {
				response.forEach(auction, index, array) {
					var auctionIdentity = auction.identity;
					de.sb.util.AJAX.invoke("/services/" + auctionIdentity + "/bid", "GET", {"Accept": "application/json"}, user, function (request) {
						self.displayStatus(request.status, request.statusText);
						if (request.status === 200) {								
							var activeElements = document.querySelectorAll("section.closed-seller-auctions td");
							activeElements[0].value = bid.bidder;
							activeElements[1].value = auction.creationTimestamp;
							activeElements[2].value = auction.closureTimestamp;
							activeElements[3].value = auction.title;
							activeElements[4].value = auction.unitCount;
							activeElements[5].value = auction.askingPrice;
							activeElements[6].value = bid.price;
						}
					});
				}
			}
		});	
	}
} ());