describe('TrueFalseAnswer', function () {
  it('shall be possible to check and uncheck answer', function () {
    var answer = new H5P.TrueFalse.Answer();

    var event;
    answer.on('checked', function (e) {
      event = e;
    });

    answer.check();
    expect(answer.isChecked()).toBe(true);
    expect(event).not.toBe(undefined);
    expect(event.type).toBe('checked');
    answer.uncheck();
    expect(answer.isChecked()).toBe(false);
  });

  it('shall not be possible to change a disabled answer', function () {
    var answer = new H5P.TrueFalse.Answer();
    answer.check();
    answer.disable();
    expect(answer.isChecked()).toBe(true);
    answer.uncheck();
    expect(answer.isChecked()).toBe(true);
  });

  it('shall be possible to reset an answer', function () {
    var answer = new H5P.TrueFalse.Answer();
    answer.check();
    answer.reset();
    expect(answer.isChecked()).toBe(false);
  });

  it('shall be possible to make an answer tabable/untabable', function () {
    var answer = new H5P.TrueFalse.Answer();

    answer.tabable(true);
    var $dom = answer.getDomElement();
    expect($dom.attr('tabIndex')).toBe('0');

    answer.tabable(false);
    $dom = answer.getDomElement();
    expect($dom.attr('tabIndex')).toBe(undefined);
  });
});
