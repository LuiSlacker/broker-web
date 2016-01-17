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
	var APPLICATION = de.sb.broker.APPLICATION;

	/**
	 * Creates a new closedAuctions controller that is derived from an abstract controller.
	 * @param sessionContext {de.sb.broker.SessionContext} a session context
	 */
	de.sb.broker.OpenAuctionsController = function (sessionContext) {
		SUPER.call(this, 1, sessionContext);
		this.statusLog = [];
	}
	de.sb.broker.OpenAuctionsController.prototype = Object.create(SUPER.prototype);
	de.sb.broker.OpenAuctionsController.prototype.constructor = de.sb.broker.OpenAuctionsController;


	/**
	 * Displays the associated view.
	 */
	de.sb.broker.OpenAuctionsController.prototype.display = function () {
		if (!this.sessionContext.user) return;
		SUPER.prototype.display.call(this);
		this.displayStatus(200, "OK");

		var openAuctionElement = document.querySelector("#open-auctions-template").content.cloneNode(true).firstElementChild;
		var AuctionInputElement = document.querySelector("#auction-form-template").content.cloneNode(true).firstElementChild;
		document.querySelector("main").appendChild(openAuctionElement);
		document.querySelector("main").appendChild(AuctionInputElement);
		
		this.displayOpenAuctions();
	}


	/**
	 * Displays the closed auctions of the user.
	 */
	de.sb.broker.OpenAuctionsController.prototype.displayOpenAuctions = function () {
		var self = this;
		var user = this.sessionContext.user;
		de.sb.util.AJAX.invoke("/services/auctions/", "GET", {"Accept": "application/json"}, null, user, function (request) {
			self.statusLog.push({"status": request.status, "statusText": request.statusText});
			if (request.status === 200) {
				var auctions = JSON.parse(request.responseText);
				auctions.forEach(function(auction, index){
					var tableRowElement = de.sb.broker.APPLICATION.generateTableRows(7).cloneNode(true); 
					var tableCells = tableRowElement.querySelectorAll('output');
					tableCells[0].value = auction.seller.alias;
					tableCells[1].value = de.sb.broker.APPLICATION.prettyDate(auction.creationTimestamp);
					tableCells[2].value = de.sb.broker.APPLICATION.prettyDate(auction.closureTimestamp);
					tableCells[3].value = auction.title;
					tableCells[3].title = auction.description;
					tableCells[4].value = auction.unitCount;
					tableCells[5].value = de.sb.broker.APPLICATION.prettyPrice(auction.askingPrice);
					if (JSON.stringify(user.alias) === JSON.stringify(auction.seller.alias)) {
						var bidField = document.createElement('Button');
						bidField.type = "button";
						bidField.value = "edit auction";
						var text = document.createTextNode("edit");       // Create a text node
						bidField.appendChild(text);  
					} else {
						var bidField = document.createElement('Input');
						bidField.type = "number";
						bidField.value = de.sb.broker.APPLICATION.prettyPrice(auction.askingPrice);
					}
					tableCells[6].appendChild(bidField);
					document.querySelector("section.open-auctions tbody").appendChild(tableRowElement);
				});
			}
		});	
	}
	
	/**
	 * Displays the closed auctions of the user.
	 */
	de.sb.broker.OpenAuctionsController.prototype.findMyBidFromAuction = function (auction) {
		var user = this.sessionContext.user;
		var myBid;
		auction.bids.forEach(function(bid, index){
			if (bid.bidder.identity == user.identity){
				myBid = bid;
			}
		});
		return myBid;
	}
} ());