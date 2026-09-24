"use strict";

var SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces"
];

var MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

var CATEGORIES = ["career", "love", "wealth", "risk", "space", "humor"];

var STAR_BLURBS = {
  Aries: "Aries lights the fuse early. For entertainment only, this chart dares a clean ignition: one target, fewer side quests, and enough thrust to leave the launch pad before lunch. The sky is not awarding trophies. It is timing a countdown you already feel in your chest.",
  Taurus: "Taurus gathers mass the way planets do — slowly, then undeniably. The playful chart puts value where you refuse to be rushed: a craft, a savings habit, a person you keep showing up for. Steady thrust still reaches orbit when you stop restarting the engine for applause.",
  Gemini: "Gemini lives on signal bounce. Strictly for fun, the chart has you tuning an idea and a conversation until they lock phase like twin radios. Write the useful part down before the next shiny object changes the channel and erases the frequency.",
  Cancer: "Cancer builds the habitat while others argue about the destination. The novelty chart points at basecamp: a safer rhythm, a kinder boundary, a home that can support a longer mission. Soft structure is still structure — and hermetically sealed kindness travels far.",
  Leo: "Leo wants the spotlight and the payload that deserves it. The entertainment stars say put the real thing where people can see it — a demo, a page, a promise you can keep under bright lights. Applause is optional weather. Evidence is the guidance system.",
  Virgo: "Virgo debugs the universe one bolt at a time. The playful reading puts your edge in the checklist everyone else skips between coffee and chaos. Fix one system until it runs clean, then resist rebuilding it out of affection for tweaks and tiny screws.",
  Libra: "Libra balances the load so the craft does not tumble. For amusement only, the chart shows a pact that needs clearer terms and a fairer split of the mass. Harmony arrives through a decision with a timestamp, not through another graceful delay.",
  Scorpio: "Scorpio will stare at the dark side of the Moon without flinching. The fun chart hints at a truth you already suspect under the surface noise. Name it, jettison the dead weight, and keep the crew circle small, loyal, and pressure-tested.",
  Sagittarius: "Sagittarius aims downrange past the comfortable horizon. The entertainment heavens draw a long arc: a trip, a bold application, a question too big for the current room. Pack light. Curiosity is the engine; jokes are the heat shield.",
  Capricorn: "Capricorn builds the tower and then invites the inspector with a clipboard. The playful stars endorse a serious plan with milestones a stranger could audit. Ambition only lands when the structure can hold the landing gear and the ego.",
  Aquarius: "Aquarius rewires the grid while committees debate the old wiring diagram. For entertainment only, the chart blinks at an unconventional fix at small scale. Run the test, publish the result, and let the data argue louder than the meeting.",
  Pisces: "Pisces swims through signal, dream, and static at once. The novelty chart asks for a tank around the fuel: a date, a draft, a collaborator who likes reality enough to bring snacks. Imagination remains propellant — it still needs plumbing."
};

var MALE_RANK = [
  "google uk english male",
  "microsoft david",
  "microsoft george",
  "microsoft mark",
  "microsoft guy",
  "daniel",
  "alex",
  "aaron",
  "arthur",
  "ralph",
  "bruce",
  "fred",
  "tom",
  "oliver",
  "nathan",
  "brian",
  "christopher",
  "rishi",
  "gordon",
  "james",
  "ryan",
  "guy"
];

var FEMALE_HINTS = [
  "female",
  "samantha",
  "victoria",
  "karen",
  "moira",
  "zira",
  "susan",
  "fiona",
  "tessa",
  "veena",
  "serena",
  "allison",
  "ava",
  "kate",
  "nicky",
  "google us english",
  "google uk english female"
];

function fnv1a(str) {
  var h = 0x811c9dc5;
  for (var i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  var a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickN(rng, list, n) {
  var pool = list.slice();
  var out = [];
  for (var i = 0; i < n; i += 1) {
    if (!pool.length) break;
    var idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

function initialsOf(name) {
  return name
    .trim()
    .split(/\s+/)
    .map(function (word) {
      var chars = Array.from(word);
      var found = "";
      for (var i = 0; i < chars.length; i += 1) {
        if (/[\p{L}\p{N}]/u.test(chars[i])) {
          found = chars[i];
          break;
        }
      }
      return found ? found.toLocaleUpperCase("en-US") : "";
    })
    .join("");
}

function signFromIso(iso) {
  var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!match) return "";
  var year = Number(match[1]);
  var month = Number(match[2]);
  var day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";
  var dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) {
    return "";
  }
  var key = month * 100 + day;
  var bands = [
    [120, 218, "Aquarius"],
    [219, 320, "Pisces"],
    [321, 419, "Aries"],
    [420, 520, "Taurus"],
    [521, 620, "Gemini"],
    [621, 722, "Cancer"],
    [723, 822, "Leo"],
    [823, 922, "Virgo"],
    [923, 1022, "Libra"],
    [1023, 1121, "Scorpio"],
    [1122, 1221, "Sagittarius"]
  ];
  for (var i = 0; i < bands.length; i += 1) {
    if (key >= bands[i][0] && key <= bands[i][1]) return bands[i][2];
  }
  if ((key >= 1222 && key <= 1231) || (key >= 101 && key <= 119)) return "Capricorn";
  return "";
}

function formatBorn(iso) {
  var parts = iso.split("-");
  var month = MONTHS[Number(parts[1]) - 1];
  return month + " " + Number(parts[2]) + ", " + parts[0];
}

function sealFrom(seed) {
  var hex = seed.toString(16).toUpperCase().padStart(8, "0");
  return hex.slice(0, 4) + "-" + hex.slice(4);
}

function todayIso() {
  var now = new Date();
  var month = String(now.getMonth() + 1).padStart(2, "0");
  var day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

function assertBank(data) {
  if (!data || typeof data !== "object") throw new Error("Fortune bank missing.");
  CATEGORIES.forEach(function (key) {
    if (!Array.isArray(data[key]) || data[key].length < 20) {
      throw new Error("Fortune category is incomplete: " + key);
    }
    data[key].forEach(function (item) {
      if (typeof item !== "string" || !item.trim()) {
        throw new Error("Empty fortune in " + key);
      }
    });
  });
}

function buildReading(input, bank) {
  var key = input.initials + "|" + input.birthday + "|" + input.sign;
  var seed = fnv1a(key);
  var rng = mulberry32(seed);
  var career = pickN(rng, bank.career, 2).join(" ");
  var heart = pickN(rng, bank.love, 2).join(" ");
  var cosmos = [
    pickN(rng, bank.space, 1)[0],
    pickN(rng, bank.wealth, 1)[0],
    pickN(rng, bank.risk, 1)[0]
  ].join(" ");
  var humor = pickN(rng, bank.humor, 1)[0];
  var model = {
    name: input.name,
    sign: input.sign,
    born: formatBorn(input.birthday),
    seal: sealFrom(seed),
    career: career,
    heart: heart,
    cosmos: cosmos,
    humor: humor,
    star: STAR_BLURBS[input.sign]
  };
  var lines = [
    "Elon's Cosmic Oracle",
    "For " + model.name,
    model.sign + ", born " + model.born,
    "Seal " + model.seal,
    "",
    "Career",
    model.career,
    "",
    "Heart",
    model.heart,
    "",
    "Cosmos",
    model.cosmos,
    "",
    model.humor,
    "",
    "Star chart, for entertainment only",
    model.star
  ];
  return {
    model: model,
    plain: lines.join("\n"),
    seed: seed
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (ch) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch];
  });
}

function slipHtml(model) {
  return [
    '<p class="kicker">Elon\'s Cosmic Oracle</p>',
    "<h2>For " + escapeHtml(model.name) + "</h2>",
    '<p class="meta">' + escapeHtml(model.sign) + ", born " + escapeHtml(model.born) + "</p>",
    '<p class="seal">Seal ' + escapeHtml(model.seal) + "</p>",
    '<h3 class="section">Career</h3>',
    "<p>" + escapeHtml(model.career) + "</p>",
    '<h3 class="section">Heart</h3>',
    "<p>" + escapeHtml(model.heart) + "</p>",
    '<h3 class="section">Cosmos</h3>',
    "<p>" + escapeHtml(model.cosmos) + "</p>",
    '<p class="quip">' + escapeHtml(model.humor) + "</p>",
    '<div class="star-block">',
    "<h3>Star chart, for entertainment only</h3>",
    '<p class="star">' + escapeHtml(model.star) + "</p>",
    "</div>"
  ].join("");
}

function scoreVoice(voice) {
  var name = voice.name.toLowerCase();
  var lang = (voice.lang || "").toLowerCase();
  var score = 0;
  if (lang.indexOf("en") === 0) score += 3;
  else score -= 6;
  if (name.indexOf("male") !== -1) score += 10;
  if (name.indexOf("female") !== -1) score -= 10;
  FEMALE_HINTS.forEach(function (hint) {
    if (name.indexOf(hint) !== -1) score -= 6;
  });
  for (var i = 0; i < MALE_RANK.length; i += 1) {
    if (name.indexOf(MALE_RANK[i]) !== -1) {
      score += 24 - i;
      break;
    }
  }
  return score;
}

function chooseVoice() {
  if (!("speechSynthesis" in window)) return null;
  var voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;
  var best = null;
  var bestScore = -999;
  voices.forEach(function (voice) {
    var score = scoreVoice(voice);
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  });
  if (best && bestScore < 0) {
    var english = null;
    voices.forEach(function (voice) {
      if (!english && (voice.lang || "").toLowerCase().indexOf("en") === 0) english = voice;
    });
    return english || best;
  }
  return best;
}

function voicePitch(voice) {
  if (!voice) return 0.8;
  var name = voice.name.toLowerCase();
  var femaleish = name.indexOf("female") !== -1;
  FEMALE_HINTS.forEach(function (hint) {
    if (name.indexOf(hint) !== -1) femaleish = true;
  });
  return femaleish ? 0.7 : 0.84;
}

function speechChunks(plain) {
  var chunks = [];
  plain.split(/\n+/).forEach(function (line) {
    var trimmed = line.trim();
    if (!trimmed) return;
    var parts = trimmed.split(/(?<=[.!?])\s+/);
    parts.forEach(function (part) {
      var bit = part.trim();
      if (bit) chunks.push(bit);
    });
  });
  return chunks;
}

function boot() {
  var form = document.getElementById("oracle-form");
  var nameInput = document.getElementById("seeker-name");
  var birthdayInput = document.getElementById("seeker-birthday");
  var signInput = document.getElementById("seeker-sign");
  var formError = document.getElementById("form-error");
  var submitBtn = document.getElementById("submit-btn");
  var scene = document.getElementById("scene");
  var consultStatus = document.getElementById("consult-status");
  var placeholder = document.getElementById("placeholder");
  var slipWrap = document.getElementById("slip-wrap");
  var slip = document.getElementById("slip");
  var slipBody = document.getElementById("slip-body");
  var actions = document.getElementById("actions");
  var hearBtn = document.getElementById("hear-btn");
  var copyBtn = document.getElementById("copy-btn");
  var speechStatus = document.getElementById("speech-status");
  var copyStatus = document.getElementById("copy-status");

  var bank = null;
  var currentPlain = "";
  var readingId = 0;
  var speakToken = 0;
  var pendingAutoId = -1;
  var revealTimer = 0;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  birthdayInput.max = todayIso();
  submitBtn.disabled = true;
  formError.textContent = "Loading the star ledger…";

  function setSpeechStatus(message) {
    speechStatus.textContent = message;
  }

  function primeSpeech() {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.resume();
      var wake = new SpeechSynthesisUtterance(" ");
      wake.volume = 0;
      wake.rate = 2;
      window.speechSynthesis.speak(wake);
    } catch (err) {
      /* The hear button still works if warmup is blocked. */
    }
  }

  function withVoices(done) {
    if (!("speechSynthesis" in window)) {
      done();
      return;
    }
    if (window.speechSynthesis.getVoices().length) {
      done();
      return;
    }
    var settled = false;
    var finish = function () {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener("voiceschanged", finish);
      done();
    };
    window.speechSynthesis.addEventListener("voiceschanged", finish);
    window.setTimeout(finish, 400);
  }

  function startSpeech(plain) {
    pendingAutoId = -1;
    if (!plain) return;
    if (!("speechSynthesis" in window)) {
      setSpeechStatus("This browser has no speech synthesis. The slip is the whole reading.");
      hearBtn.disabled = true;
      return;
    }
    var token = ++speakToken;
    window.speechSynthesis.cancel();
    window.setTimeout(function () {
      withVoices(function () {
        if (token !== speakToken) return;
        var voice = chooseVoice();
        var pitch = voicePitch(voice);
        var chunks = speechChunks(plain);
        setSpeechStatus(voice
          ? "Elon is reading the slip… (" + voice.name + ")"
          : "Elon is reading the slip…");
        chunks.forEach(function (text, index) {
          var utterance = new SpeechSynthesisUtterance(text);
          if (voice) utterance.voice = voice;
          utterance.lang = voice && voice.lang ? voice.lang : "en-US";
          utterance.pitch = pitch;
          utterance.rate = 0.96;
          utterance.volume = 1;
          utterance.onend = function () {
            if (token !== speakToken) return;
            if (index === chunks.length - 1) setSpeechStatus("Elon finished reading the slip.");
          };
          utterance.onerror = function (event) {
            if (token !== speakToken) return;
            var reason = event && event.error ? event.error : "";
            if (reason === "interrupted" || reason === "canceled" || reason === "cancelled") return;
            setSpeechStatus("Speech stopped. Press “Hear Elon read it” to try again.");
          };
          window.speechSynthesis.speak(utterance);
        });
        window.speechSynthesis.resume();
      });
    }, 60);
  }

  function autoSpeak(id) {
    if (id !== pendingAutoId || id !== readingId) return;
    pendingAutoId = -1;
    startSpeech(currentPlain);
  }

  function reveal(reading, id) {
    if (id !== readingId) return;
    slipBody.innerHTML = slipHtml(reading.model);
    slip.setAttribute("aria-label", "Reading for " + reading.model.name);
    currentPlain = reading.plain;
    consultStatus.hidden = true;
    scene.classList.remove("is-consulting");
    actions.hidden = false;
    hearBtn.disabled = !("speechSynthesis" in window);
    slipWrap.classList.add("is-open");
    pendingAutoId = id;
    if (!reduceMotion) {
      slip.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    if (reduceMotion) autoSpeak(id);
    else window.setTimeout(function () { autoSpeak(id); }, 1050);
  }

  slipWrap.addEventListener("transitionend", function (event) {
    if (event.propertyName !== "grid-template-rows") return;
    if (event.target !== slipWrap) return;
    autoSpeak(pendingAutoId);
  });

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    var ok = document.execCommand("copy");
    area.remove();
    if (!ok) throw new Error("copy failed");
  }

  copyBtn.addEventListener("click", function () {
    if (!currentPlain) return;
    var done = function () {
      copyStatus.textContent = "Copied the reading to the clipboard.";
    };
    var fail = function () {
      copyStatus.textContent = "Could not copy automatically. Select the slip and copy it manually.";
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(currentPlain).then(done).catch(function () {
        try { fallbackCopy(currentPlain); done(); } catch (err) { fail(); }
      });
    } else {
      try { fallbackCopy(currentPlain); done(); } catch (err) { fail(); }
    }
  });

  hearBtn.addEventListener("click", function () {
    primeSpeech();
    startSpeech(currentPlain);
  });

  birthdayInput.addEventListener("input", function () {
    var sign = signFromIso(birthdayInput.value);
    if (sign) signInput.value = sign;
  });

  birthdayInput.addEventListener("change", function () {
    var sign = signFromIso(birthdayInput.value);
    if (sign) signInput.value = sign;
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    copyStatus.textContent = "";
    if (!bank) {
      formError.textContent = "The fortune ledger has not loaded yet.";
      return;
    }
    var name = nameInput.value.trim().replace(/\s+/g, " ");
    var birthday = birthdayInput.value;
    var sign = signInput.value;
    var errors = [];
    if (!name) errors.push("Enter your name.");
    if (!birthday) errors.push("Enter your birthday.");
    else if (!signFromIso(birthday)) errors.push("That birthday could not be read.");
    else if (birthday > todayIso()) errors.push("Birthday has to be today or earlier.");
    if (SIGNS.indexOf(sign) === -1) errors.push("Choose a star sign.");
    if (errors.length) {
      formError.textContent = errors.join(" ");
      return;
    }
    formError.textContent = "";
    var reading = buildReading({
      name: name,
      initials: initialsOf(name),
      birthday: birthday,
      sign: sign
    }, bank);

    var id = ++readingId;
    pendingAutoId = -1;
    speakToken += 1;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    primeSpeech();
    window.clearTimeout(revealTimer);
    scene.classList.add("is-consulting");
    consultStatus.hidden = false;
    placeholder.hidden = true;
    actions.hidden = true;
    slipWrap.classList.remove("is-open");
    setSpeechStatus("");
    submitBtn.textContent = "Consult again";

    var delay = reduceMotion ? 0 : 1650;
    revealTimer = window.setTimeout(function () {
      reveal(reading, id);
    }, delay);
  });

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) return;
    speakToken += 1;
    pendingAutoId = -1;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  });

  fetch("fortunes.json", { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(function (data) {
      assertBank(data);
      bank = data;
      submitBtn.disabled = false;
      formError.textContent = "";
    })
    .catch(function () {
      submitBtn.disabled = true;
      formError.textContent = "Could not load fortunes.json. Serve this folder with a local web server and reload.";
    });
}

if (typeof document !== "undefined") {
  boot();
}
