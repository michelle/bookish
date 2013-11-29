var END_SPAN = '</span>';

var $scrollDiv = $('#globalContainer');
var cachedHeight = 0;


// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
// http://ejohn.org/blog/javascript-micro-templating/
var template = (function(){
  var cache = {};

  return function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'") +
        "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn(data) : fn;
  };
})();


// http://developer.chrome.com/extensions/tabs.html#method-sendMessage can be
// used to change languages via the popup.
var deprecatedDictionary = [
  {
    'word': '我的',
    'pinyin': 'wo3de5',
    'defn': 'my'
  },
  {
    'word': '你',
    'pinyin': 'ni3',
    'defn': 'you'
  },
  {
    'word': '有',
    'pinyin': 'you3',
    'defn': 'have'
  },
  {
    'word': '时间',
    'pinyin': 'shi2jian1',
    'defn': 'time'
  },
  {
    'word': '火鸡',
    'defn': 'turkey',
    'pinyin': 'huo3ji1'
  }
];
var definitionLookup = {};

function preprocess() {
  // Preprocessing step.
  // Hardcoded static file for now.
  $.getJSON('http://cdn.peerjs.com/bookish/integrated_chinese.csv.json', function(dictionary) {
    // We want to go through this backwards as a rule because usually the more
    // obscure words come later.
    for (var i = dictionary.length - 1; i >= 0; i -= 1) {
      var term = dictionary[i];
      definitionLookup[term.defn] = term;
    }
    findContent();
  });
}

var BOOKISH_REPLACEMENT_TEMPLATE = '<span class="__bookish-card">' +
    '<span class="b-word" title="<%= pinyin %>"><%= word %></span>' +
    '<span class="b-defn b-hidden"><%= defn %></span>' +
    '</span>';
// Space between replacements.
var BUFFER = 1;

function lookupAndReplace(defn) {
  var term = definitionLookup[defn.toLocaleLowerCase()];
  if (!term) {
    return false;
  }

  return template(BOOKISH_REPLACEMENT_TEMPLATE, {
    word: term.term,
    defn: defn,
    pinyin: term.pron
  });
}

function attemptReplacement(tokens, index, length) {
  var defn = tokens[index];
  for (var i = index + 1; i < index + length && tokens[i]; i++) {
    defn += ' ' + tokens[i];
  }
  return lookupAndReplace(defn);
}


function findContent() {
  if ($scrollDiv.height() !== cachedHeight) {
    var wordCount = 0;
    cachedHeight = $scrollDiv.height();

    // We can't avoid going over all of them again, unfortunately, because FB
    // forces a redraw of statuses, stripping the HTML.
    $('.userContent').each(function() {

      var $userContent = $(this);

      // Avoid redrawing statuses that've already been processed.
      if ($userContent.find('.__bookish-card').length) {
        return;
      }

      // TODO: currently words attached to punctuation will never be translated!
      // :(
      var text = $userContent.text(),
          tokens = text.split(' '),
          newText = [];
      var i = 0, ii = tokens.length;
      while (i < ii) {
        var replacement;
        for (var j = 4; j > 0; j -= 1) {
          replacement = attemptReplacement(tokens, i, j);
          if (replacement) {
            newText.push(replacement);
            break;
          }
        }

        if (replacement) {
          // Advance by the number of words consumed
          i += j;

          // Skip BUFFER amount of words so we don't get overwhelmed by context.
          var k = i + BUFFER;
          while (i < k) {
            if (tokens[i]) {
              newText.push(tokens[i]);
              i += 1;
            } else {
              break;
            }
          }
        } else {
          // Advance the window forward by one word and give up on tokens[i]
          newText.push(tokens[i]);
          i += 1;
        }
      }

      newText = newText.join(' ');

      if (newText !== text) {
        $userContent.html(newText);
      }

    });
  }

  setTimeout(findContent, 1000);
}

$scrollDiv.on('click', '.__bookish-card', function() {
  toggleTerm.call(this);
});


// TODO: a toggle-all?
function toggleTerm() {
  $card = $(this);
  $card.find('.b-defn').toggleClass('b-hidden');
  $card.find('.b-word').toggleClass('b-hidden');
}

preprocess();
