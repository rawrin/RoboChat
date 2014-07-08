angular.module('roboChat.services', [])
  .factory('dummyPlug', function() {
    this.users = users;
    this.pronouns = pronouns;
    this.fragments = fragments;
    this.etc = etc;
    return this;
  })

  .factory('Eventer', function() {
    var events = {};
    return {
      on: function(event, callback) {
        if (!events[event]) {
          events[event] = [];
        }
        events[event].push(callback);
      },
      trigger: function(event, data) {
        if (!events[event]) return;
        var callbacks = events[event];
        for (var i = 0; i < callbacks.length; i++) {
          callbacks[i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
      }
    };
  });
