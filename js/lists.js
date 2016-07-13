function loadLists(state) {
  const {blocklist, allowedHosts, entityList} = state;

  const blockListPromise = loadJSON('disconnect-blocklist.json').then((xhr) => {
    processBlockListJSON(xhr.response, blocklist);
  });

  const entityListPromise = loadJSON('disconnect-entitylist.json').then((xhr) => {
    processEntityListJSON(xhr.response, entityList);
  });

  const allowedHostsPromise = getAllowedHostsList(allowedHosts);

  return Promise.all([blockListPromise, entityListPromise, allowedHostsPromise]);
}


function loadJSON(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.addEventListener("load", () => resolve(xhr));
    xhr.addEventListener("error", () => reject(xhr));
    xhr.send();
  });
}


function processEntityListJSON(data, entityList) {
}

function processBlockListJSON(data, blocklist) {
  // remove un-needed categories per disconnect
  delete data.categories['Content'];
  delete data.categories['Legacy Disconnect'];
  delete data.categories['Legacy Content'];

  // parse thru the disconnect blocklist and create
  // local blocklist "grouped" by main domain. I.e.,
  // blocklist["facebook.com"] = http://www.facebook.com
  // blocklist["fb.com"] = http://www.facebook.com
  // blocklist["doubleclick.net"] = http://www.google.com
  // blocklist["google-analytics.com"] = http://www.google.com
  // etc.
  for (category_name in data.categories) {
    var category = data.categories[category_name];
    var entity_count = category.length;

    for (var i = 0; i < entity_count; i++) {
      var entity = category[i];

      for (entity_name in entity) {
        var urls = entity[entity_name];

        for (main_domain in urls) {
          blocklist[main_domain] = [];
          var domains = urls[main_domain];
          var domains_count = domains.length;

          for (var j = 0; j < domains_count; j++) {
            blocklist[domains[j]] = main_domain;
          }
        }
      }
    }
  }

}


function getAllowedHostsList(allowedHosts) {
  return new Promise(function(resolve, reject) {
    browser.storage.local.get("allowedHosts", function(item) {
      if (Object.keys(item).length === 0) {
        allowedHosts = [];
      } else {
        allowedHosts = item.allowedHosts;
      }
      resolve(allowedHosts);
    });
  });
}


module.exports = {
  loadLists
}
