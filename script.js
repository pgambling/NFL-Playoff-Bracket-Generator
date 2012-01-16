(function () {
var Game = function (homeId, visitorId, winnerSelectId) {
	this.$home = $('#' + homeId);
	this.$visitor = $('#' + visitorId);
	this.$winnerSelect = $('#' + winnerSelectId);
};

var Conference = function () {
	this.wildcardGames = {};
	this.divPlayoffGames = {};
	this.$championSelect = {};
};

var afc = new Conference();
var nfc = new Conference();
var superbowl = {
	$championSelect: {},
	$scoreInput: {}
};
	
var teamNameToSeed = {};

var init = function () {
	var addToTeamNameToSeed = function (seed, teamName) {
		teamNameToSeed[teamName] = seed;
	};
	$.each(config.afc_seeds, addToTeamNameToSeed);
	$.each(config.nfc_seeds, addToTeamNameToSeed);
	
	afc.wildcardGames[1] = new Game("wildCard_afc_game1_home", "wildCard_afc_game1_visitor", "wildCard_afc_game1_winner");
	afc.wildcardGames[2] = new Game("wildCard_afc_game2_home", "wildCard_afc_game2_visitor", "wildCard_afc_game2_winner");	
	afc.divPlayoffGames[1] = new Game("divPlayoff_afc_game1_home", "divPlayoff_afc_game1_visitor", "divPlayoff_afc_game1_winner");
	afc.divPlayoffGames[2] = new Game("divPlayoff_afc_game2_home", "divPlayoff_afc_game2_visitor", "divPlayoff_afc_game2_winner");
	afc.$championSelect = $('#afc_champion');

	nfc.wildcardGames[1] = new Game("wildCard_nfc_game1_home", "wildCard_nfc_game1_visitor", "wildCard_nfc_game1_winner");
	nfc.wildcardGames[2] = new Game("wildCard_nfc_game2_home", "wildCard_nfc_game2_visitor", "wildCard_nfc_game2_winner");	
	nfc.divPlayoffGames[1] = new Game("divPlayoff_nfc_game1_home", "divPlayoff_nfc_game1_visitor", "divPlayoff_nfc_game1_winner");
	nfc.divPlayoffGames[2] = new Game("divPlayoff_nfc_game2_home", "divPlayoff_nfc_game2_visitor", "divPlayoff_nfc_game2_winner");
	nfc.$championSelect = $('#nfc_champion');
	
	superbowl.$championSelect = $('#superbowl_champion');
	superbowl.$scoreInput = $('#superbowl_score');
};

var setMenuOptions = function ($menu, optionList) {
	$menu.html('');
	for (var i = optionList.length - 1; i >= 0; i--){
		var item = optionList[i];
		$menu.append($('<option />').val(item).text(item));
	}
	$menu.change();
};

var wildcardWinnerOnChange = function (conference) {
	var highestSeed, lowestSeed,
		game1Winner = conference.wildcardGames[1].$winnerSelect.val(),
		game2Winner = conference.wildcardGames[2].$winnerSelect.val(),
		playoffGame1 = conference.divPlayoffGames[1],
		playoffGame2 = conference.divPlayoffGames[2];
	
	if(teamNameToSeed[game1Winner] > teamNameToSeed[game2Winner]) {
		highestSeed = game1Winner;
		lowestSeed = game2Winner;
	} else {
		highestSeed = game2Winner;
		lowestSeed = game1Winner;
	}
	
	playoffGame1.$visitor.html(highestSeed);
	setMenuOptions(playoffGame1.$winnerSelect, [playoffGame1.$home.text(), highestSeed]);
	playoffGame2.$visitor.html(lowestSeed);
	setMenuOptions(playoffGame2.$winnerSelect, [playoffGame2.$home.text(), lowestSeed]);
};

var divPlayoffWinnerOnChange = function (conference) {
	var games = conference.divPlayoffGames;
	setMenuOptions(conference.$championSelect, [games[1].$winnerSelect.val(), games[2].$winnerSelect.val()]);
};

var confChampionOnChange = function () {
	setMenuOptions(superbowl.$championSelect, [afc.$championSelect.val(), nfc.$championSelect.val()]);
};

var generateSubmission = function () {
	var afcWildGame1 = afc.wildcardGames[1].$winnerSelect.val(), 
		afcWildGame2 = afc.wildcardGames[2].$winnerSelect.val(), 
		afcDivGame1 = afc.divPlayoffGames[1].$winnerSelect.val(),
		afcDivGame2 = afc.divPlayoffGames[2].$winnerSelect.val(),
		afcChamp = afc.$championSelect.val(),
		nfcWildGame1 = nfc.wildcardGames[1].$winnerSelect.val(),
		nfcWildGame2 = nfc.wildcardGames[2].$winnerSelect.val(),
		nfcDivGame1 = nfc.divPlayoffGames[1].$winnerSelect.val(),
		nfcDivGame2 = nfc.divPlayoffGames[2].$winnerSelect.val(),
		nfcChamp = nfc.$championSelect.val(),
		superbowlChamp = superbowl.$championSelect.val(),
		superbowlScore = superbowl.$scoreInput.val();
		
	var submission = [
		"AFC Wildcard Game 1: " + afcWildGame1,
		"AFC Wildcard Game 2: " + afcWildGame2,
		"AFC Divisional Game 1: " + afcDivGame1,
		"AFC Divisional Game 2: " + afcDivGame2,
		"AFC Champion: " + afcChamp,
		"NFC Wildcard Game 1: " + nfcWildGame1,
		"NFC Wildcard Game 2: " + nfcWildGame2,
		"NFC Divisional Game 1: " + nfcDivGame1,
		"NFC Divisional Game 2: " + nfcDivGame2,
		"NFC Champion: " + nfcChamp,
		"Super Bowl Champion: " + superbowlChamp,
		"Super Bowl Score: " + superbowlScore
	].join("<br />");
	
	submission += "<br /><br />For your bookie: " + [
		afcWildGame1,
		afcWildGame2,
		afcDivGame1,
		afcDivGame2,
		afcChamp,
		nfcWildGame1,
		nfcWildGame2,
		nfcDivGame1,
		nfcDivGame2,
		nfcChamp,
		superbowlChamp,
		superbowlScore
	].join(',');
	
	return submission;
};

var buildMailToLink = function (to, subject, message) {
	var params = {};
	if(subject) params.Subject = subject;
	if(message) params.Body = message.replace(/<br \/>/g,"\n");
	return "mailto:" + to + "?" + $.param(params);
};

var sendToBookieOnClick = function () {
	if(superbowl.$scoreInput.val().length === 0) {
		alert('Enter the Super Bowl score!');
		return false;
	}
	
	var submission = generateSubmission();
	var mailToLink = buildMailToLink(config.bookieEmail, config.emailSubject, submission);
	
	var newBody = $('<body />');
	var instructions = $("<p />")
		.html("If a new email didn't open automatically, copy and paste the following text and send it to <a>" + config.bookieEmail + "</a>:");
	instructions.find('a').attr('href',mailToLink);
	newBody.append(instructions);
	newBody.append(submission);
	$(document.body).replaceWith(newBody);
	window.open(mailToLink);
};

var wireUpEvents = function () {
	function afcWildcardChange () { wildcardWinnerOnChange(afc); }
	function nfcWildcardChange () { wildcardWinnerOnChange(nfc); }
	function afcDivPlayoffChange () { divPlayoffWinnerOnChange(afc); }
	function nfcDivPlayoffChange () { divPlayoffWinnerOnChange(nfc); }
	for (var i=1; i <= 2; i++) {
		afc.wildcardGames[i].$winnerSelect.change(afcWildcardChange);
		nfc.wildcardGames[i].$winnerSelect.change(nfcWildcardChange);

		afc.divPlayoffGames[i].$winnerSelect.change(afcDivPlayoffChange);
		nfc.divPlayoffGames[i].$winnerSelect.change(nfcDivPlayoffChange);
	}
	
	$.each([afc.$championSelect, nfc.$championSelect], function () {
		this.change(confChampionOnChange);	
	});
	
	$('#sendToBookie').click(sendToBookieOnClick);
};

var populateBeginningRounds = function () {
	afc.wildcardGames[1].$home.html(config.afc_seeds[3]);
	afc.wildcardGames[1].$visitor.html(config.afc_seeds[6]);
	afc.wildcardGames[2].$home.html(config.afc_seeds[4]);
	afc.wildcardGames[2].$visitor.html(config.afc_seeds[5]);
	nfc.wildcardGames[1].$home.html(config.nfc_seeds[3]);
	nfc.wildcardGames[1].$visitor.html(config.nfc_seeds[6]);
	nfc.wildcardGames[2].$home.html(config.nfc_seeds[4]);
	nfc.wildcardGames[2].$visitor.html(config.nfc_seeds[5]);
	afc.divPlayoffGames[1].$home.html(config.afc_seeds[1]);
	afc.divPlayoffGames[2].$home.html(config.afc_seeds[2]);
	nfc.divPlayoffGames[1].$home.html(config.nfc_seeds[1]);
	nfc.divPlayoffGames[2].$home.html(config.nfc_seeds[2]);
	
	setMenuOptions(afc.wildcardGames[1].$winnerSelect, [config.afc_seeds[3], config.afc_seeds[6]]);
	setMenuOptions(afc.wildcardGames[2].$winnerSelect, [config.afc_seeds[4], config.afc_seeds[5]]);
	setMenuOptions(nfc.wildcardGames[1].$winnerSelect, [config.nfc_seeds[3], config.nfc_seeds[6]]);
	setMenuOptions(nfc.wildcardGames[2].$winnerSelect, [config.nfc_seeds[4], config.nfc_seeds[5]]);
};

$(function () {
	init();
	wireUpEvents();
	populateBeginningRounds();
});
	
}());