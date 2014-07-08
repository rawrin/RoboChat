angular.module('roboChat.controllers', ['roboChat.services'])
  .controller('ChatController', ['$scope', 'Eventer', 'dummyPlug', function($scope, Eventer, dummyPlug) {
    $scope.nickname = "Guest";
    $scope.messages = [];
    $scope.users = {};

    var userHash = function(list) {
      for (var i = 0; i < list.length; i++) {
        $scope.users[list[i]] = true;
      }
    };

    userHash(dummyPlug.users);

    // Receives event from server.
    Eventer.on('msg:send', function(msg) {
      $scope.messages.push(msg);
    });

    // Server-side will handle name collisions
    Eventer.on('user:join', function(user) {
      var join = {date: new Date(), text: user + " has joined the room.", isEvent: true};
      $scope.messages.push(join);
      $scope.users.user = true;
    });

    // Receives request from server and updates userHash
    Eventer.on('user:change', function(evnt) {
      delete $scope.users[evnt.user];
      $scope.users[evnt.newUser] = true;
      $scope.messages.push(evnt);
    });

    $scope.submit = function() {
      if ($scope.message !== "") {
        if (!nameChanger($scope.message)) {
          var postMsg = {date: new Date(), user: $scope.nickname, text: $scope.message, isEvent: false};
          // Triggers event on server, server will send to other clients.
          Eventer.trigger('msg:send', postMsg);
          $scope.message = "";
        }
      }
    };
    // Can be changed to intercept all / commands
    var nameChanger = function(msg) {
      var nickname = msg.match("^\/nick (.*)");
      if (nickname && nickname.length === 2 && !nickname[1].match(" ") && nickname[1].length < 10 && !$scope.users[nickname[1]]) {
        var evnt = {date: new Date(), user: $scope.nickname, newUser: nickname[1], text: $scope.nickname + " changed name to " + nickname[1], isEvent: true};
        $scope.nickname = nickname[1];
        $scope.message = "";
        Eventer.trigger('user:change', evnt);
        return true;
      } else {
        return false;
      }
    };

  }])

  // Pseudo-Server
  .controller('DummyController', ['$scope', '$interval', 'Eventer', 'dummyPlug', function($scope, $interval, Eventer, dummyPlug) {
    // Generates a random msg to be sent..

    Eventer.trigger('user:join', $scope.nickname);

    var msgGen = function() {
      var user = dummyPlug.users[Math.floor(Math.random() * dummyPlug.users.length)];
      var pronoun = dummyPlug.pronouns[Math.floor(Math.random() * dummyPlug.pronouns.length)];
      var fragment = dummyPlug.fragments[Math.floor(Math.random() * dummyPlug.fragments.length)];
      var noun = dummyPlug.users[Math.floor(Math.random() * dummyPlug.users.length)];
      var etc = dummyPlug.etc[Math.floor(Math.random() * dummyPlug.etc.length)];
      return {date: new Date(), user:user, text: pronoun + fragment + noun + etc, isEvent: false};
    };

    var trigger = function() {
      var msg = msgGen();
      Eventer.trigger('msg:send', msg);
    };

    trigger();
    // Sends a dummy msg every 5 seconds..
    $interval(trigger, 5000);
  }]);



