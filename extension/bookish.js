var START = '<span class="__bookish-card" data-original="';
var MIDDLE = '">';
var END = '</span>';

var $scrollDiv = $('#globalContainer');
var cachedHeight = 0;


// TODO: actually import a dictionary from CSV.
// TODO: this should be sorted in order of defn length so phrases take
// precedence over words.
var dictionary = {
  'you': '你',
  'have': '有',
  'time': '时间'
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
      repl: generateReplacement(defn, word)
    });
  }
}


function generateReplacement(defn, word) {
  return START + defn + MIDDLE + word + END;
}


function findContent() {
  if ($scrollDiv.height() !== cachedHeight) {
    var wordCount = 0;
    cachedHeight = $scrollDiv.height();

    // We can't avoid going over all of them again, unfortunately, because FB
    // forces a redraw of statuses, stripping the HTML.
    $('.userContent').each(function() {

      var $userContent = $(this);
      var text = $userContent.text();
      var newText = text;

      for (var i = 0, ii = terms.length; i < ii; i += 1) {
        var term = terms[i];
        newText = newText.replace(term.re0, term.repl);
        newText = newText.replace(term.re1, term.repl);
      }

      if (newText !== text) {
        $userContent.html(newText);
      }

    });
  }

  setTimeout(findContent, 1000);
}

$scrollDiv.on('mouseenter', '.__bookish-card', function() {
  showOriginal.call(this);
});
$scrollDiv.on('touchstart', '.__bookish-card', function() {
  showOriginal.call(this);
});

$scrollDiv.on('mouseleave', '.__bookish-card', function() {
  showTerm.call(this);
});
$scrollDiv.on('touchend', '.__bookish-card', function() {
  showTerm.call(this);
});


function showOriginal() {
  $card = $(this);
  if (!$card.data('term')) {
    $card.data('term', $card.text());
  }
  $card.text($card.data('original'));
}

function showTerm() {
  $card = $(this);
  $card.text($card.data('term'));
}

preprocess();
findContent();
