    var ref = new Firebase("https://hacker-news.firebaseio.com/v0/");
    var topRef = ref.child("topstories");
    var itemRef = ref.child("item");
    var countRef = new Firebase("https://wordcount.firebaseio.com/words/");
    var allCounts = [];

    var commonWords = ['a', 'the', 'an', 'on', 'to', 'it', 'and', 'in', 'that', 'have', 'i', 'for', 'with', 'as', 'at', 'by', 'or', 'their', 'what', 'its', 'us', 'of', 'is', 'you', 'your', 'be'];
    var badChars = ['#', ".", '$', '[', ']', '-', '(', ')', ''];

    String.prototype.cleanup = function(word) {
      return word.replace(/[^a-zA-Z0-9]+/g, "");
    };

    countRef.set(null);

    topRef.on("child_added", function(snapshot) {
      var query = itemRef.child(snapshot.val());
      query.once("value", function(snap) {

        var title = snap.val().title;
        var wordArray = title.split(/[ ,:-]+/);
        for (var i in wordArray) {
          var common = false;
          var badChar = false;
          var seen = false;
          var word = wordArray[i];

          word = word.cleanup(word).trim(word);
          word = word.toLowerCase();

          //Check to see if it's a common word
          for (var j in commonWords) {
            if (commonWords[j] === word) {
              common = true;
            }
          }
          //Make sure it doesn't contain bad characters
          for (var k in badChars) {
            if ((word.indexOf(badChars[k])) !== -1) {
              badChar = true;
            }
          }

          //Add the word to Firebase
          if (((isNaN(parseInt(word)))) && (!common) && (word !== '') && (word.length !== 1)) {
            countRef.child(word).transaction(function(current_value) {
              return {'.value': (current_value || 0) + 1, '.priority': -((current_value || 0) + 1)};
            });
          }
        }
      });
    });

    countRef.once('value', function (snap) {
      var words = snap.val();
      for (var word in words) {
        var count = words[word];
        allCounts.push(count);
        $('<div/>').text(word + ': ' + count).addClass("word " + count).appendTo($('#words'));
      }
    });

    console.log(allCounts);