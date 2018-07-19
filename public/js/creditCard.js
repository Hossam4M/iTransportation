$(function() {
    $("#card-number").change(function() {
      $("#card-type").val(CardJs.cardTypeFromNumber($(this).val()));
      var cleanCardNumber = CardJs.numbersOnlyString($(this).val());
      $(this).val(CardJs.applyFormatMask(cleanCardNumber, 'XXXX XXXX XXXX XXXX'));
      $("#mask-1").val(CardJs.applyFormatMask(cleanCardNumber, 'XX-XX-XX-XX-XX-XX-XX-XX'));
      $("#mask-2").val(CardJs.applyFormatMask(cleanCardNumber, '+0 XXXX-XXXXXX @XXXXXX'));
    });
});

(function() {
  var ccnum  = document.getElementById('ccnum'),
      type   = document.getElementById('ccnum-type'),
      expiry = document.getElementById('expiry'),
      cvc    = document.getElementById('cvc'),
      result = document.getElementById('validation');

  payform.cardNumberInput(ccnum);
  payform.expiryInput(expiry);
  payform.cvcInput(cvc);

  ccnum.addEventListener('input',updateType);

  // result.addEventListener('click', function() {
  $('#ccnum,#expiry,#cvc').on('input', function() {
    var valid     = [],
        expiryObj = payform.parseCardExpiry(expiry.value);

    valid.push(fieldStatus(ccnum,  payform.validateCardNumber(ccnum.value)));
    valid.push(fieldStatus(expiry, payform.validateCardExpiry(expiryObj)));
    valid.push(fieldStatus(cvc,    payform.validateCardCVC(cvc.value, type.innerHTML)));

    if (valid.every(Boolean)) {
    // if (true) {
      $('#GoRide').prop('disabled',false);
      $('#validation').html('valid <i class="fa fa-check" aria-hidden="true"></i>');
      $('#validation').removeClass('text-danger');
      $('#validation').addClass('text-success');
    } else {
      $('#validation').html('invalid <i class="fa fa-times" aria-hidden="true"></i>');
      $('#GoRide').prop('disabled',true);
      $('#validation').removeClass('text-success');
      $('#validation').addClass('text-danger');
    }

  });

  function updateType(e) {
    var cardType = payform.parseCardType(e.target.value);
    type.innerHTML = cardType || 'invalid';
  }


  function fieldStatus(input, valid) {
    if (valid) {
      removeClass(input.parentNode, 'error');
    } else {
      addClass(input.parentNode, 'error');
    }
    return valid;
  }

  function addClass(ele, _class) {
    if (ele.className.indexOf(_class) === -1) {
      ele.className += ' ' + _class;
    }
  }

  function removeClass(ele, _class) {
    if (ele.className.indexOf(_class) !== -1) {
      ele.className = ele.className.replace(_class, '');
    }
  }
})();
