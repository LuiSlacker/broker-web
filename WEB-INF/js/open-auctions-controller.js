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
		openAuctionElement.querySelector("button").addEventListener("click", this.showAuctionTemplate.bind(this));
		document.querySelector("main").appendChild(openAuctionElement);
		
		this.displayOpenAuctions();
	}

	de.sb.broker.OpenAuctionsController.prototype.showAuctionTemplate = function(auction){
		var AuctionInputElement = document.querySelector("#auction-form-template").content.cloneNode(true).firstElementChild;
		if (document.querySelector("main").lastChild.className == "auction-form"){
			document.querySelector("main").removeChild(document.querySelector("main").lastChild);
		}
		var inputElements = AuctionInputElement.querySelectorAll("input");
		
		var creationTimeStamp = Date.now();
		inputElements[0].value = de.sb.broker.APPLICATION.prettyDate(creationTimeStamp);
		inputElements[1].value = de.sb.broker.APPLICATION.prettyDate(creationTimeStamp + 30*24*60*60*1000);
		
		if (auction.identity){
			inputElements[0].value = de.sb.broker.APPLICATION.prettyDate(auction.creationTimestamp);
			inputElements[1].value = de.sb.broker.APPLICATION.prettyDate(auction.closureTimestamp);
			inputElements[2].value = auction.title;
			AuctionInputElement.querySelector("textarea").value = auction.description;
			inputElements[4].value = de.sb.broker.APPLICATION.prettyPrice(auction.askingPrice);
			inputElements[3].value = auction.unitCount;
		}
		AuctionInputElement.querySelector("button").addEventListener("click", this.persistNewAuction.bind(this, auction, creationTimeStamp));
		document.querySelector("main").appendChild(AuctionInputElement);
	}

	/**
	 * Displays the closed auctions of the user.
	 */
	de.sb.broker.OpenAuctionsController.prototype.displayOpenAuctions = function () {
		var self = this;
		var user = this.sessionContext.user;
		var node = document.querySelector("section.open-auctions tbody");
		while (node.hasChildNodes()) {
		    node.removeChild(node.lastChild);
		}
		de.sb.util.AJAX.invoke("/services/auctions/?closed=false", "GET", {"Accept": "application/json"}, null, user, function (request) {
			self.statusLog.push({"status": request.status, "statusText": request.statusText});
			if (request.status === 200) {
				var auctions = JSON.parse(request.responseText);
				auctions.forEach(function(auction, index){
					var tableRowElement = de.sb.broker.APPLICATION.generateTableRows(7).cloneNode(true); 
					var tableCells = tableRowElement.querySelectorAll('output');
					tableCells[0].value = auction.seller.alias;
					tableCells[0].title = auction.seller.name.givenName;
					tableCells[1].value = de.sb.broker.APPLICATION.prettyDate(auction.creationTimestamp);
					tableCells[2].value = de.sb.broker.APPLICATION.prettyDate(auction.closureTimestamp);
					tableCells[3].value = auction.title;
					tableCells[3].title = auction.description;
					tableCells[4].value = auction.unitCount;
					tableCells[5].value = de.sb.broker.APPLICATION.prettyPrice(auction.askingPrice);
					if ((user.identity) === (auction.seller.identity)) {
						var bidField = document.createElement('Button');
						bidField.type = "button";
						bidField.value = "edit auction";
						bidField.addEventListener("click", function(){
							self.showAuctionTemplate(auction);
						}, auction);
						var text = document.createTextNode("edit");       // Create a text node
						bidField.appendChild(text);  
					} else {
						var bidField = document.createElement('Input');
						bidField.type = "number";
						bidField.min= de.sb.broker.APPLICATION.prettyPrice(auction.askingPrice);
						bidField.step="1.00";
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
	
	de.sb.broker.OpenAuctionsController.prototype.persistNewAuction = function(auction, creationTimeStamp){
		var inputElements = document.querySelectorAll("section.auction-form input");

		var auction = (auction.identity) ? auction : {};
		auction.creationTimestamp = auction.creationTimestamp || creationTimeStamp;
		auction.closureTimestamp = auction.closureTimestamp || creationTimeStamp + 30*24*60*60*1000;

		auction.title = inputElements[2].value.trim();
		auction.description = document.querySelector("section.auction-form textarea").value.trim();
		auction.unitCount = inputElements[3].value;
		auction.askingPrice = inputElements[4].value.split('.').join('');

		var self = this;
		var header = {"Content-type": "application/json"};
		var body = JSON.stringify(auction);
		de.sb.util.AJAX.invoke("/services/auctions", "PUT", header, body, this.sessionContext, function (request) {
			self.displayStatus(request.status, request.statusText);
			if (request.status === 200) {
				self.displayOpenAuctions();
				document.querySelector("main").removeChild(document.querySelector(".auction-form"));
			} else if (request.status === 409) {
				de.sb.broker.APPLICATION.welcomeController.display(); 
			} else {
				self.displayOpenAuctions();
			}
		});
	}
} ());