// Clean up v0.0.3 (moved to local storage)
chrome.storage.sync.remove(['_debug', '_trace']);

var debug;
localGet('_debug', function (data) {
  debug = data._debug === true;
  console.log('debug', debug);
});
var trace;
localGet('_trace', function (data) {
  trace = data._trace === true;
  console.log('trace', trace);
});
localGet('_lastWorldID', function (result) {
  setWorldID(result._lastWorldID);
});

chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostContains: 'forgeofempires.com', pathEquals: '/game/index'}
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.hasOwnProperty('debug')) {
      setDebug(request.debug);
    }
    if (request.hasOwnProperty('trace')) {
      setTrace(request.trace);
    }
    if (request.hasOwnProperty('resend_messages')) {
      chrome.runtime.sendMessage(msgCache);
    }
    if (request.hasOwnProperty('clear_cache')) {
      clearCache(request.clear_cache);
    }
  });

chrome.runtime.onMessageExternal.addListener(
  function (request, sender, sendResponse) {
    if (request.hostname) {
      var match = RegExp('^[^\\.]*').exec(request.hostname);
      setWorldID(match[0]);
    }

    if (request.jsonRequest) {
      if (trace) {
        console.log('request', request.jsonRequest);
      }
    }

    if (request.jsonResponse) {
      if (trace) {
        console.log('response', request.jsonResponse);
      }

      for (var i = 0; i < request.jsonResponse.length; i++) {
        response = request.jsonResponse[i];
        switch (response.requestClass) {
          case 'BattlefieldService':
            battleField.process(response.requestMethod, response.responseData, response.requestId);
            break;
          case 'CityMapService':
            cityMap.process(response.requestMethod, response.responseData, response.requestId);
            break;
          case 'GreatBuildingsService':
            greatBuilding.process(response.requestMethod, response.responseData, response.requestId);
            break;
          case 'HiddenRewardService':
            rewards.process(response.requestMethod, response.responseData, response.requestId);
            break;
          case 'OtherPlayerService':
            otherPlayer.process(response.requestMethod, response.responseData, response.requestId);
            break;
          case 'StartupService':
            startup.process(response.requestMethod, response.responseData, response.requestId);
          case 'TimeService':
            // Extremely not interesting
            break;
          default:
            if (trace || debug) {
              console.log(response.requestClass + '.' + response.requestMethod + ' is not used');
            }
        }
      }
    }
  });

function setDebug (value) {
  debug = value;
  localSet({_debug: debug}, function () {
    console.log('debug', debug);
  });
}

function setTrace (value) {
  trace = value;
  localSet({_trace: trace}, function () {
    console.log('trace', trace);
  });
}
