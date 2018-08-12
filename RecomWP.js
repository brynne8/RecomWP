// ==UserScript==
// @name         RecomWP
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Wikipedia Recommendation System
// @author       Alexander Misel
// @match        https://zh.wikipedia.org/*
// @grant        none
// ==/UserScript==

(function() {

// Polyfill for Wikipedia with no jQuery
if (!window.mw || !window.mw.config) {
  window.mw = {
    config: {
      set: function (data) {
        for(var key in data) {
          window[key] = data[key];
        }
      }
    },
    loader: {
      load: function (data) {
        console.log(data);
      },
      state: function () {},
      implement: function () {}
    }
  };
  window.RLQ[0]();
  window.RLQ[1]();
}

if (window.wgNamespaceNumber === 0 || window.wgPageName === 'Special:¿Õ°×Ò³Ãæ/RecomWP') {
var wpdb;

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

console.log('RecomWP initialised.');

var DBOpenRequest = window.indexedDB.open("RecomWP");

DBOpenRequest.onerror = function(event) {
  console.log('Error loading database.');
};

DBOpenRequest.onsuccess = function(event) {
  console.log('Database initialised.');

  // store the result of opening the database in the db variable. This is used a lot below
  wpdb = DBOpenRequest.result;

  if (window.wgArticleId) {
    addData({
      pageId: window.wgArticleId,
      pageName: window.wgPageName
    });
  } else {
    generateRecom();
  }
};

DBOpenRequest.onupgradeneeded = function(event) {
  wpdb = event.target.result;

  wpdb.onerror = function(event) {
    console.error('Error loading database.');
  };

  // Create an objectStore for this database

  var objectStore = wpdb.createObjectStore("historyArticles", { keyPath: "pageId" });

  // define what data items the objectStore will contain

  objectStore.createIndex("pageName", "pageName", { unique: true });
  objectStore.createIndex("visitCount", "visitCount", { unique: false });
  objectStore.createIndex("lastTime", "lastTime", { unique: false });

  console.log('Object store created.');
};

function addData(newItem) {
  var transaction = wpdb.transaction(["historyArticles"], "readwrite");

  // report on the success of the transaction completing, when everything is done
  transaction.oncomplete = function() {
    console.log('Transaction completed: database modification finished.');
  };

  transaction.onerror = function() {
    console.error('Transaction not opened due to error: ' + transaction.error + '');
  };

  // call an object store that's already been added to the database
  var objectStore = transaction.objectStore("historyArticles");

  objectStore.openCursor(newItem.pageId).onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      newItem.visitCount = cursor.value.visitCount + 1;
      newItem.lastTime = Date.now();

      var request = cursor.update(newItem);
      request.onsuccess = function() {
        console.log('Update success');
      };
    } else {
      newItem.visitCount = 1;
      newItem.lastTime = Date.now();
      var objectStoreRequest = objectStore.add(newItem);
      objectStoreRequest.onsuccess = function(event) {
        console.log('Insert success');
      };
    }
  };
}

function relativeSearch(pageName, callback) {
  var queryUrl = 'https://zh.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageimages|description&piprop=thumbnail&pithumbsize=160&generator=search&gsrsearch=morelike%3A'
                + encodeURI(pageName) + '&gsrnamespace=0&gsrlimit=5&gsrqiprofile=classic_noboostlinks&uselang=content&smaxage=86400&maxage=86400';
  var request = new XMLHttpRequest();
  request.open('GET', queryUrl, true);
  request.onload = function() {
    var contentType = request.status === 204 ? '' : request.getResponseHeader('content-type');
    if (request.status >= 200 && request.status < 400) {
      var responseText = JSON.parse(request.responseText);
      callback(responseText);
    }
  };
  request.send();
}

function generateRecom() {
  /*
   * Simple implementation of Binary heap
   */
  function BinaryHeap(scoreFunction){
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  BinaryHeap.prototype = {
    push: function(element) {
      // Add the new element to the end of the array.
      this.content.push(element);
      // Allow it to bubble up.
      this.bubbleUp(this.content.length - 1);
    },

    pop: function() {
      // Store the first element so we can return it later.
      var result = this.content[0];
      // Get the element at the end of the array.
      var end = this.content.pop();
      // If there are any elements left, put the end element at the
      // start, and let it sink down.
      if (this.content.length > 0) {
        this.content[0] = end;
        this.sinkDown(0);
      }
      return result;
    },

    remove: function(node) {
      var length = this.content.length;
      // To remove a value, we must search through the array to find
      // it.
      for (var i = 0; i < length; i++) {
        if (this.content[i] != node) continue;
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();
        // If the element we popped was the one we needed to remove,
        // we're done.
        if (i == length - 1) break;
        // Otherwise, we replace the removed element with the popped
        // one, and allow it to float up or sink down as appropriate.
        this.content[i] = end;
        this.bubbleUp(i);
        this.sinkDown(i);
        break;
      }
    },

    size: function() {
      return this.content.length;
    },

    bubbleUp: function(n) {
      // Fetch the element that has to be moved.
      var element = this.content[n], score = this.scoreFunction(element);
      // When at 0, an element can not go up any further.
      while (n > 0) {
        // Compute the parent element's index, and fetch it.
        var parentN = Math.floor((n + 1) / 2) - 1,
        parent = this.content[parentN];
        // If the parent has a lesser score, things are in order and we
        // are done.
        if (score >= this.scoreFunction(parent))
          break;

        // Otherwise, swap the parent with the current element and
        // continue.
        this.content[parentN] = element;
        this.content[n] = parent;
        n = parentN;
      }
    },

    sinkDown: function(n) {
      // Look up the target element and its score.
      var length = this.content.length,
      element = this.content[n],
      elemScore = this.scoreFunction(element);

      while(true) {
        // Compute the indices of the child elements.
        var child2N = (n + 1) * 2, child1N = child2N - 1;
        // This is used to store the new position of the element,
        // if any.
        var swap = null;
        // If the first child exists (is inside the array)...
        if (child1N < length) {
          // Look it up and compute its score.
          var child1 = this.content[child1N],
          child1Score = this.scoreFunction(child1);
          // If the score is less than our element's, we need to swap.
          if (child1Score < elemScore)
            swap = child1N;
        }
        // Do the same checks for the other child.
        if (child2N < length) {
          var child2 = this.content[child2N],
          child2Score = this.scoreFunction(child2);
          if (child2Score < (swap == null ? elemScore : child1Score))
            swap = child2N;
        }

        // No need to swap further, we are done.
        if (swap == null) break;

        // Otherwise, swap and continue.
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      }
    }
  };

  var heap = new BinaryHeap(function(x) {
    var res = ((Date.now() - x.lastTime) / 604800000) - x.visitCount;
    return res;
  });

  // Database iterate
  var objectStore = wpdb.transaction('historyArticles').objectStore('historyArticles');

  objectStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      heap.push(cursor.value);
      cursor.continue();
    } else {
      relativeSearch(heap.pop().pageName, function (data) {
        if (data.batchcomplete) {
          console.log(data.query.pages);
        }
      })
    }
  };
}

}

})();