    var ref = new Firebase("https://hacker-news.firebaseio.com/v0/");
    var topRef = ref.child("topstories");
    var itemRef = ref.child("item");
    var countRef = new Firebase("https://wordcount.firebaseio.com/");

    var commonWords = ['a', 'the', 'an', 'on', 'to', 'it', 'and', 'in', 'that', 'have', 'i', 'for', 'with', 'as', 'at', 'by', 'or', 'their', 'what', 'its', 'us', 'of'];
    var badChars = ['#', ".", '$', '[', ']', '-', '(', ')', ''];

    String.prototype.cleanup = function(word) {
      return word.replace(/[^a-zA-Z0-9]+/g, "");
    }

    countRef.set(null);

    topRef.on("child_added", function(snapshot) {
      var query = itemRef.child(snapshot.val());
      query.once("value", function(snap) {
        var title = snap.val().title;
        var wordArray = title.split(/[ ,:-]+/);
        for (var i in wordArray) {
          var common = false;
          var ok = true;
          var word = wordArray[i];
          word = word.toLowerCase();
          for (var j in commonWords) {
            if (commonWords[j] === word) {
              common = true;
            }
          }
          for (var k in badChars) {
            if ((word.indexOf(badChars[k])) !== -1) {
              ok = false;
            }
          }
          if ((parseInt(word) !== NaN) && (!common) && (word !== '') && (isNaN(parseFloat(word)))) {
            word = word.cleanup(word).trim(word);
            countRef.child('words').child(word).transaction(function(current_value) {
              return (current_value || 0) + 1;
            });
          }
        }
      });
    });

    countRef.once('value', function (snap) {
      var obj = (snap.val()['words']);
      for (var i in obj) {
        var count = obj[i];
        $('<div/>').text(i + ': ' + count).appendTo($('#words'));
      }
    });