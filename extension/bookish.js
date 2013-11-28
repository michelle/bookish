var END_SPAN = '</span>';

var $scrollDiv = $('#globalContainer');
var cachedHeight = 0;


// TODO: actually import a dictionary from CSV.
// TODO: this should be sorted in order of defn length so phrases take
// precedence over words.
// These should live statically on a remote server.
// http://developer.chrome.com/extensions/tabs.html#method-sendMessage can be
// used to change languages via the popup.
var dictionary = {
  'you': '你',
  'have': '有',
  'time': '时间',
  'turkey': '火鸡'
};
var terms = [];


function preprocess() {
  // Preprocessing step.
  var definitions = Object.keys(dictionary);

  for (var i = 0, ii = definitions.length; i < ii; i += 1) {
    var defn = definitions[i];
    var word = dictionary[defn];

    terms.push({
      re0: new RegExp('\\b' + defn + '\\b', 'gi'),
      re1: new RegExp('\\b' + word + '\\b', 'gi'),
      repl: generateReplacement(defn, word),
      word: word,
      defn: defn
    });
  }
}

function generateSpan(className) {
  className = className || '';
  return '<span class="' + className + '">';
}

function generateReplacement(defn, word) {
  var replacement = generateSpan('__bookish-card');

  replacement += generateSpan('b-word');
  replacement += word;
  replacement += END_SPAN;

  // Hide definition at first.
  replacement += generateSpan('b-defn b-hidden');
  replacement += defn;
  replacement += END_SPAN;

  replacement += END_SPAN;
  return replacement;
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

      var text = $userContent.text();
      var newText = text;
      var numRepl = 0;
      var maxRepl = Math.ceil(text.split(' ').length / 4);

      // TODO: repls should be spaced apart. :(
      for (var i = 0, ii = terms.length; i < ii && numRepl < maxRepl; i += 1) {
        var term = terms[i];
        if (newText.indexOf(term.defn) !== -1) {
          newText = newText.replace(term.re0, term.repl);
          numRepl += 1;
        } else if (newText.indexOf(term.word) !== -1) {
          newText = newText.replace(term.re1, term.repl);
          numRepl += 1;
        }
      }

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
findContent();
