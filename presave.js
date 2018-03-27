var H5PPresave = H5PPresave || {};

H5PPresave['H5P.TrueFalse'] = function (content, finished) {
  var presave = H5PEditor.Presave;

  if (isContentInValid()) {
    throw new presave.exceptions.InvalidContentSemanticsException('Invalid True/False Error');
  }

  if (finished) {
    finished({maxScore: 1});
  }

  function isContentInValid() {
    return !presave.checkNestedRequirements(content, 'content.question') || content.question.trim() === '';
  }
};
