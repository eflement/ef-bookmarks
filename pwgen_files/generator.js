document.addEventListener("DOMContentLoaded", function () {
  var generateButton = document.getElementById("generateButton");
  var copyButton = document.getElementById("copyButton");
  var wordCountSelect = document.getElementById("wordCount");
  var numberCountSelect = document.getElementById("numberCount");
  var specialCountSelect = document.getElementById("specialCount");
  var separatorRadios = document.getElementsByName("separator");
  var randomUppercaseCheckbox = document.getElementById("randomUppercase");

  var newPassphrase = document.getElementById("newPassphrase");

  var passphraseComponents = [];

  generateButton.addEventListener("click", function () {
    var numWords = parseInt(wordCountSelect.value);
    var numNumbers = parseInt(numberCountSelect.value);
    var numSpecials = parseInt(specialCountSelect.value);
    var separator = getSelectedSeparator();

    do {
      passphrase = generatePassphrase(
        numWords,
        numNumbers,
        numSpecials,
        separator
      );
    } while (randomUppercaseCheckbox.checked && (!containsUppercase(passphrase) || !containsLowercase(passphrase)));

    displayPassphrase(passphrase);
  });

  copyButton.addEventListener("click", function () {
    var passphraseText = newPassphrase.textContent;
    copyToClipboard(passphraseText);
  });

  function generatePassphrase(numWords, numNumbers, numSpecials, separator) {
    let elements = [];

    for (let i = 0; i < numWords; i++) {
      elements.push(generateWord());
    }

    for (let i = 0; i < numNumbers; i++) {
      elements.push(generateNumber());
    }

    for (let i = 0; i < numSpecials; i++) {
      elements.push(generateSpecial());
    }

    shuffleArray(elements);

    passphraseComponents = elements;

    return elements.join(separator);
  }

  function generateWord() {
    let word;

    do {
      let num = "";
      for (let i = 0; i < 5; i++) {
        num += getDiceRoll().toString();
      }

      word = diceware[num];

      if (isNumeric(word) || isSpecialCharacter(word)) {
        continue;
      }

      if (randomUppercaseCheckbox.checked && getRandomChance()) {
        word = word.toUpperCase();
      }
    } while (isNumeric(word) || isSpecialCharacter(word));

    return word;
  }

  function getRandomChance() {
    var array = new Uint8Array(1);
    window.crypto.getRandomValues(array);
    return array[0] < 128;
  }

  function generateNumber() {
    var array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % 10;
  }

  function generateSpecial() {
    var num = "";
    for (var i = 0; i < 2; i++) {
      num += getDiceRoll().toString();
    }

    var word = special[num];

    return word;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = secureRandom(i + 1);

      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function secureRandom(max) {
    var array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }

  function isNumeric(str) {
    return !isNaN(str) && !isNaN(parseFloat(str));
  }

  function isSpecialCharacter(str) {
    return /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(str);
  }

  function containsUppercase(str) {
    return /[A-Z]/.test(str);
  }

  function containsLowercase(str) {
    return /[a-z]/.test(str);
  }

  function displayPassphrase(passphrase) {
    newPassphrase.textContent = passphrase;
    updatePasswordStrength(passphrase);

    newPassphrase.addEventListener("click", function () {
      var input = document.createElement("input");
      input.type = "text";
      input.value = newPassphrase.textContent;
      input.className = "passphraseInput";

      newPassphrase.replaceWith(input);
      input.focus();
      input.select();

      input.addEventListener("blur", function () {
        newPassphrase.textContent = input.value;
        input.replaceWith(newPassphrase);
        updatePasswordStrength(input.value);
      });
    });
  }

  function updatePassphraseWithNewSeparator() {
    var newSeparator = getSelectedSeparator();
    var passphrase = passphraseComponents.join(newSeparator);
    newPassphrase.textContent = passphrase;
    updatePasswordStrength(passphrase);
  }

  function getSelectedSeparator() {
    var selectedSeparator = " ";
    for (var i = 0; i < separatorRadios.length; i++) {
      if (separatorRadios[i].checked) {
        selectedSeparator = separatorRadios[i].value;
        break;
      }
    }
    return selectedSeparator;
  }

  function copyToClipboard(text) {
    var textarea = document.createElement("textarea");
    textarea.textContent = text;
    document.body.appendChild(textarea);

    textarea.select();

    try {
      var successful = document.execCommand("copy");
      if (successful) {
        console.log("Text copied to clipboard");
      } else {
        console.error("Unable to copy text");
      }
    } catch (err) {
      console.error("Error in copying text: " + err);
    }

    document.body.removeChild(textarea);
  }

  separatorRadios.forEach(function (radio) {
    radio.addEventListener("change", function () {
      if (newPassphrase.textContent) {
        updatePassphraseWithNewSeparator();
      }
    });
  });

  function getDiceRoll() {
    var array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return (array[0] % 6) + 1;
  }

  // Password Strength
  const passwordLength = document.getElementById('passwordLength');
  const passwordScore = document.getElementById("passwordScore");
  const passwordCrackTime = document.getElementById("passwordCrackTime");
  function updatePasswordStrength(passphrase) {
    const result = zxcvbnNl(passphrase, Object.values(diceware));

    console.log(result);

    updateLength(passphrase.length);
    updateScoreDisplay(result.score);
    updateCrackTime(
      result.crack_times_seconds.offline_slow_hashing_1e4_per_second.toFixed(2)
    );
  }
  function updateLength(passphraseLength) {
    let passwordLengthText = "";
    
    if(passphraseLength == 1) passwordLengthText = `${passphraseLength} karakter`;
    else passwordLengthText = `${passphraseLength} karakters`;

    passwordLength.textContent = passwordLengthText;
}
  function updateScoreDisplay(score) {
    let scoreText = "";
    let scoreColor = "";

    switch (score) {
      case 0:
      case 1:
        scoreText = "Zeer zwak";
        scoreColor = "#c0392b";
        break;
      case 2:
        scoreText = "Zwak";
        scoreColor = "#f39c12";
        break;
      case 3:
        scoreText = "Goed";
        scoreColor = "#1abc9c";
        break;
      case 4:
        scoreText = "Sterk";
        scoreColor = "#27ae60";
        break;
    }

    passwordScore.innerHTML = scoreText;
    passwordLength.style.color = scoreColor;
    passwordScore.style.color = scoreColor;
    passwordCrackTime.style.color = scoreColor;
  }

  function updateCrackTime(seconds) {
    let formattedTime;

    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;
    const century = year * 100;

    if (seconds < 1) formattedTime = "minder dan een seconde";
    else if (seconds < minute) formattedTime = formatTime(seconds, "seconde");
    else if (seconds < hour)
      formattedTime = formatTime(seconds / minute, "minuut");
    else if (seconds < day) formattedTime = formatTime(seconds / hour, "uur");
    else if (seconds < week) formattedTime = formatTime(seconds / day, "dag");
    else if (seconds < month)
      formattedTime = formatTime(seconds / week, "week");
    else if (seconds < year)
      formattedTime = formatTime(seconds / month, "maand");
    else if (seconds < century)
      formattedTime = formatTime(seconds / year, "jaar");
    else formattedTime = formatTime(seconds / century, "eeuw");

    passwordCrackTime.textContent = formattedTime;
  }
  function formatTime(value, unit) {
    const roundedValue = Math.round(value);

    if (unit === "eeuw" && roundedValue > 1) {
      return "eeuwen";
    }

    let unitPlural = unit;
    if (roundedValue !== 1) {
      switch (unit) {
        case "seconde":
          unitPlural = "seconden";
          break;
        case "minuut":
          unitPlural = "minuten";
          break;
        case "uur":
          unitPlural = "uur";
          break;
        case "dag":
          unitPlural = "dagen";
          break;
        case "week":
          unitPlural = "weken";
          break;
        case "maand":
          unitPlural = "maanden";
          break;
        case "jaar":
          unitPlural = "jaar";
          break;
      }
    }

    return `${roundedValue} ${unitPlural}`;
  }
});
