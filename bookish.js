var $scrollDiv = $('#globalContainer');
var cachedHeight = $scrollDiv.height();

function findContent() {
  if ($scrollDiv.height() > cachedHeight) {
    cachedHeight = $scrollDiv.height();

    $('.userContent').each(function() {
      var $userContent = $(this);
      $userContent.text($userContent.text().replace(/fame/gi, '一点'));
    });
  }

  setTimeout(findContent, 1000);
}

findContent();
