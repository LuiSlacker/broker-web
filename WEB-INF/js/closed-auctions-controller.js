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
		this.statusLog = [];
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
		this.displayBidsInClosedAuctions();
	}


	/**
	 * Displays the closed auctions of the user.
	 */
	de.sb.broker.ClosedAuctionsController.prototype.displayClosedAuctions = function () {
		var self = this;
		var user = this.sessionContext.user;
		de.sb.util.AJAX.invoke("/services/people/" + user.identity + "/auctions?closed=true&seller=true", "GET", {"Accept": "application/json"}, null, user, function (request) {
			self.statusLog.push({"status": request.status, "statusText": request.statusText});
			if (request.status === 200) {
				var auctions = JSON.parse(request.responseText);
				auctions.forEach(function(auction, index){
					var winningBid = self.findAuctionWinningBid(auction);
					var tableRowElement = document.querySelector("#auction-table-row").content.querySelector('tr').cloneNode(true);
					var tableCells = tableRowElement.querySelectorAll('output');
					tableCells[0].value = (winningBid) ? winningBid.bidder.alias : "no bidder";
					tableCells[0].title = (winningBid) ? winningBid.bidder.name.given + " " + winningBid.bidder.name.family + " (" + winningBid.bidder.contact.email + ")": "";
					tableCells[1].value = self.prettyDate(auction.creationTimestamp);
					tableCells[2].value = self.prettyDate(auction.closureTimestamp);
					tableCells[3].value = auction.title;
					tableCells[4].value = auction.unitCount;
					tableCells[5].value = de.sb.broker.ClosedAuctionsController.prototype.prettyPrice(auction.askingPrice);
					tableCells[6].value = (winningBid) ? self.prettyPrice(winningBid.price) : "-";
					document.querySelector("section.closed-seller-auctions tbody").appendChild(tableRowElement);
				});
			}
		});	
	}
	
	/**
	 * Displays the closed auctions of the user.
	 */
	de.sb.broker.ClosedAuctionsController.prototype.findAuctionWinningBid = function (auction) {
		var winningBid = null;
		var highestPrice = 0;
		auction.bids.forEach(function(bid, index){
			if (bid.price > highestPrice){
				highestPrice = bid.price;
				winningBid = bid;
			}
		});
		return winningBid;
	}
	
	/**
	 * Displays the closed auctions of the user.
	 */
	de.sb.broker.ClosedAuctionsController.prototype.findMyBidFromAuction = function (auction) {
		var user = this.sessionContext.user;
		var myBid;
		auction.bids.forEach(function(bid, index){
			if (bid.bidder.identity == user.identity){
				myBid = bid;
			}
		});
		return myBid;
	}
	
	/**
	 * Displays the closed auctions of the user.
	 */
	de.sb.broker.ClosedAuctionsController.prototype.displayBidsInClosedAuctions = function () {
		var self = this;
		var user = this.sessionContext.user;
		de.sb.util.AJAX.invoke("/services/people/" + user.identity + "/auctions?closed=true&seller=false", "GET", {"Accept": "application/json"}, null, user, function (request) {
			self.statusLog.push({"status": request.status, "statusText": request.statusText});
			if (request.status === 200) {
				var auctions = JSON.parse(request.responseText);
				console.log(auctions);
				auctions.forEach(function(auction, index){
					var winningBid = self.findAuctionWinningBid(auction);
					var tableRowElement = document.querySelector("#bid-table-row").content.querySelector('tr').cloneNode(true);
					var tableCells = tableRowElement.querySelectorAll('output');
					tableCells[0].value = auction.seller.alias;
					tableCells[0].title = auction.seller.name.given + " " + auction.seller.name.family + " (" + auction.seller.contact.email + ")";
					tableCells[1].value = (winningBid) ? winningBid.bidder.alias : "no bidder";
					//tableCells[1].title = (winningBid) ? winningBid.bidder.name.given + " " + winningBid.bidder.name.family + " (" + winningBid.bidder.contact.email + ")": "";
					tableCells[2].value = self.prettyDate(auction.creationTimestamp);
					tableCells[3].value = self.prettyDate(auction.closureTimestamp);
					tableCells[4].value = auction.title;
					tableCells[5].value = auction.unitCount;
					tableCells[6].value = self.prettyPrice(auction.askingPrice);
					tableCells[7].value = self.prettyPrice(self.findMyBidFromAuction(auction).price);
					tableCells[8].value = (winningBid) ? self.prettyPrice(winningBid.price) : "-";
					document.querySelector("section.closed-bidder-auctions tbody").appendChild(tableRowElement);
				});
			}
		});	
	}
//	
//	de.sb.broker.ClosedAuctionsController.prototype.getPersonFromId = function (id) {
//		var self = this;
//		var user = this.sessionContext.user;
//		de.sb.util.AJAX.invoke("/services/people/" + id, "GET", {"Accept": "application/json"}, null, user, function (request) {
//			self.statusLog.push({"status": request.status, "statusText": request.statusText});
//			var highestStatus = self.getHighestStatus(self.statusLog);
//			self.displayStatus(highestStatus.status, highestStatus.statusText);
//			if (request.status === 200) {
//				document.querySelectorAll("section.closed-bidder-auctions td")[0].innerHTML = JSON.parse(request.responseText).alias;
//			}
//		});
//	}
} ());