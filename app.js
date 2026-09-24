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
  Aries: "Aries carries a bright spark. For entertainment only, this chart favors a clean start: pick one true aim, leave the extra battles on the shelf, and let courage walk at a human pace.",
  Taurus: "Taurus steadies the ground. For entertainment only, comfort and craft share the week: finish one lasting thing, spend on quality over glitter, and let patience collect quiet interest.",
  Gemini: "Gemini opens many windows. For entertainment only, choose two conversations that matter, write the note you keep rewriting, and let curiosity travel without scattering your peace.",
  Cancer: "Cancer guards the hearth. For entertainment only, tend the soft places: feed someone, rest early, and trust that home can be a person as much as a room.",
  Leo: "Leo warms the room. For entertainment only, share credit as freely as light, polish one proud effort, and remember applause lasts longer when it is kind.",
  Virgo: "Virgo sorts the seeds. For entertainment only, mend what is almost right, clear one small mess, and let careful hands invite larger luck.",
  Libra: "Libra balances the scales. For entertainment only, seek the fair middle, speak gently in a tense doorway, and let beauty be useful as well as lovely.",
  Scorpio: "Scorpio keeps deep water. For entertainment only, tell one true thing, release one old thorn, and let loyalty prove itself without a test.",
  Sagittarius: "Sagittarius points down the road. For entertainment only, pack light, learn aloud, and let a wide horizon cure a narrow worry.",
  Capricorn: "Capricorn climbs with purpose. For entertainment only, honor the long plan, keep one promise on time, and let ambition wear sturdy shoes.",
  Aquarius: "Aquarius opens the future a crack. For entertainment only, help the circle, try the odd idea kindly, and let progress stay human-sized.",
  Pisces: "Pisces listens to tides. For entertainment only, dream with a glass of water nearby, forgive a small weather of the heart, and let intuition arrive without forcing it."
};

var MALE_RANK = [
  "google uk english male",
  "google us english male",
  "microsoft david",
  "microsoft george",
  "microsoft mark",
  "microsoft guy",
  "english united states",
  "english (united states)",
  "en-us-x-tpd",
  "en-us-x-tpd-local",
  "en-us-x-tpd-network",
  "en-us-x-iol",
  "en-gb-x-gbd",
  "en-gb-x-gbd-local",
  "en-gb-x-gbd-network",
  "en-us-x-sfg",
  "male",
  "daniel",
  "david",
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

function parseBirthday(raw) {
  var text = String(raw || "").trim();
  if (!text) return "";
  var y, m, d, match;
  match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  if (match) {
    y = Number(match[1]);
    m = Number(match[2]);
    d = Number(match[3]);
  } else {
    match = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/.exec(text);
    if (!match) return "";
    m = Number(match[1]);
    d = Number(match[2]);
    y = Number(match[3]);
  }
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return "";
  var dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    return "";
  }
  return y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
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
    "Cosmo Voss Cosmic Oracle",
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
    '<p class="kicker">Cosmo Voss Cosmic Oracle</p>',
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
  var name = (voice.name || "").toLowerCase();
  var lang = (voice.lang || "").toLowerCase();
  var uri = String(voice.voiceURI || "").toLowerCase();
  var blob = name + " " + uri;
  var score = 0;
  if (lang.indexOf("en") === 0) score += 8;
  else score -= 12;
  if (voice.localService) score += 4;
  if (blob.indexOf("male") !== -1) score += 28;
  if (blob.indexOf("female") !== -1) score -= 40;
  FEMALE_HINTS.forEach(function (hint) {
    if (blob.indexOf(hint) !== -1) score -= 18;
  });
  for (var i = 0; i < MALE_RANK.length; i += 1) {
    if (blob.indexOf(MALE_RANK[i]) !== -1) {
      score += 40 - Math.min(i, 30);
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
  // Natural guy booth voice — not robotic / Hawking.
  if (!voice) return 0.92;
  var blob = ((voice.name || "") + " " + (voice.voiceURI || "")).toLowerCase();
  var femaleish = blob.indexOf("female") !== -1;
  FEMALE_HINTS.forEach(function (hint) {
    if (blob.indexOf(hint) !== -1) femaleish = true;
  });
  return femaleish ? 0.7 : 0.92;
}

function speechChunks(plain) {
  var chunks = [];
  String(plain || "").split(/\n+/).forEach(function (line) {
    var trimmed = line.trim();
    if (!trimmed) return;
    var parts = trimmed.replace(/([.!?])\s+/g, "$1\n").split("\n");
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
  var birthdayMonth = document.getElementById("bday-month");
  var birthdayDay = document.getElementById("bday-day");
  var birthdayYear = document.getElementById("bday-year");
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
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener("voiceschanged", function () {
        try { window.speechSynthesis.getVoices(); } catch (e) {}
      });
    } catch (e2) {}
  }

  submitBtn.disabled = true;
  formError.textContent = "Loading the star ledger…";

  function setSpeechStatus(message) {
    speechStatus.textContent = message;
  }

  var samReader = null;
  var ttsAudio = null;
  var audioCtx = null;

  function getSam() {
    if (samReader) return samReader;
    if (typeof SamJs !== "function") return null;
    samReader = new SamJs({ pitch: 58, speed: 72, mouth: 128, throat: 128 });
    return samReader;
  }

  function unlockAudio() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        if (!audioCtx) audioCtx = new AC();
        if (audioCtx.state === "suspended") audioCtx.resume();
      }
    } catch (err) {}
    try {
      if (!ttsAudio) {
        ttsAudio = new Audio();
        ttsAudio.setAttribute("playsinline", "true");
        ttsAudio.setAttribute("webkit-playsinline", "true");
        ttsAudio.preload = "auto";
      }
      // Tiny silent WAV unlock for iOS gesture chain.
      ttsAudio.src =
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";
      var p = ttsAudio.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    } catch (err2) {}
  }

  function sanitizeForSam(text) {
    return String(text || "")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[—–]/g, "-")
      .replace(/[^A-Za-z0-9 .,!?'\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function spokenPlain(plain) {
    // Read fortune body only — never the name/date header (Android was stopping there).
    var raw = String(plain || "").split("\n");
    var keep = [];
    var i = 0;
    while (i < raw.length) {
      var line = raw[i].trim();
      if (/^Career:?$/i.test(line) || /^Heart:?$/i.test(line) || /^Cosmos:?$/i.test(line)) {
        var title = line.replace(/:$/, "");
        var body = [];
        i += 1;
        while (i < raw.length) {
          var next = raw[i].trim();
          if (!next) break;
          if (/^(Career|Heart|Cosmos|Star chart|Seal|For )/i.test(next)) break;
          if (/oracle/i.test(next) && next.length < 40) break;
          body.push(next);
          i += 1;
        }
        if (body.length) keep.push(title + ". " + body.join(" "));
        continue;
      }
      i += 1;
    }
    // Short closing quip after Cosmos body, before star chart.
    var joined = keep.join(" ");
    var sawCosmos = false;
    var sawCosmosBody = false;
    for (var j = 0; j < raw.length; j += 1) {
      var bit = raw[j].trim();
      if (/^Cosmos:?$/i.test(bit)) {
        sawCosmos = true;
        sawCosmosBody = false;
        continue;
      }
      if (!sawCosmos) continue;
      if (/^Star chart/i.test(bit)) break;
      if (!bit) {
        if (sawCosmosBody) {
          // blank line after cosmos body — next short line is the quip
        }
        continue;
      }
      if (/^(Career|Heart|Cosmos|Seal|For )/i.test(bit)) continue;
      if (!sawCosmosBody) {
        sawCosmosBody = true;
        continue;
      }
      if (bit.length < 140 && joined.indexOf(bit) === -1) {
        keep.push(bit);
        break;
      }
    }
    if (!keep.length) {
      // Absolute fallback: skip header-ish lines.
      raw.forEach(function (row) {
        var t = row.trim();
        if (!t) return;
        if (/oracle|born |^Seal |^For |Star chart/i.test(t)) return;
        if (/^(Career|Heart|Cosmos):?$/i.test(t)) return;
        keep.push(t);
      });
      keep = keep.slice(0, 4);
    }
    return sanitizeForSam(keep.join(" "));
  }

  function samChunks(plain) {
    var cleaned = spokenPlain(plain);
    if (!cleaned) return [];
    var parts = speechChunks(cleaned);
    var out = [];
    var buf = "";
    parts.forEach(function (part) {
      var next = buf ? buf + " " + part : part;
      if (next.length <= 80) {
        buf = next;
        return;
      }
      if (buf) out.push(buf);
      if (part.length <= 80) {
        buf = part;
      } else {
        var words = part.split(/\s+/);
        buf = "";
        words.forEach(function (word) {
          var trial = buf ? buf + " " + word : word;
          if (trial.length <= 80) buf = trial;
          else {
            if (buf) out.push(buf);
            buf = word.slice(0, 80);
          }
        });
      }
    });
    if (buf) out.push(buf);
    return out;
  }

  function u32(n) {
    return new Uint8Array([n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255]);
  }

  function u16(n) {
    return new Uint8Array([n & 255, (n >> 8) & 255]);
  }

  function wavFromBuf8(samples) {
    var data = samples instanceof Uint8Array ? samples : new Uint8Array(samples);
    var header = new Uint8Array(44);
    var view = new DataView(header.buffer);
    var writeStr = function (offset, str) {
      for (var i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeStr(0, "RIFF");
    view.setUint32(4, 36 + data.length, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 22050, true);
    view.setUint32(28, 22050, true);
    view.setUint16(32, 1, true);
    view.setUint16(34, 8, true);
    writeStr(36, "data");
    view.setUint32(40, data.length, true);
    var out = new Uint8Array(44 + data.length);
    out.set(header, 0);
    out.set(data, 44);
    return new Blob([out], { type: "audio/wav" });
  }

  function stopTtsAudio() {
    if (!ttsAudio) return;
    try {
      ttsAudio.pause();
      ttsAudio.removeAttribute("src");
      ttsAudio.load();
    } catch (err) {}
  }

  function playWavBlob(blob, token) {
    return new Promise(function (resolve, reject) {
      if (token !== speakToken) {
        resolve(false);
        return;
      }
      if (!ttsAudio) {
        ttsAudio = new Audio();
        ttsAudio.setAttribute("playsinline", "true");
        ttsAudio.setAttribute("webkit-playsinline", "true");
      }
      var url = URL.createObjectURL(blob);
      var cleaned = false;
      var finish = function (ok, err) {
        if (cleaned) return;
        cleaned = true;
        ttsAudio.onended = null;
        ttsAudio.onerror = null;
        ttsAudio.oncanplay = null;
        try { URL.revokeObjectURL(url); } catch (e) {}
        if (ok) resolve(true);
        else reject(err || new Error("audio play failed"));
      };
      ttsAudio.muted = false;
      ttsAudio.volume = 1;
      ttsAudio.onended = function () { finish(true); };
      ttsAudio.onerror = function () { finish(false, new Error("audio element error")); };
      ttsAudio.oncanplay = function () {
        if (token !== speakToken) {
          finish(false, new Error("cancelled"));
          return;
        }
        var playPromise = ttsAudio.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch(function (err) { finish(false, err); });
        }
      };
      ttsAudio.src = url;
      try { ttsAudio.load(); } catch (e2) {}
    });
  }

  function speakWithNative(plain, token) {
    return new Promise(function (resolve, reject) {
      if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
        reject(new Error("no speechSynthesis"));
        return;
      }

      var chunks = speechChunks(spokenPlain(plain)).filter(function (part) {
        return part && part.length;
      });
      // Extra safety: hard-split long chunks for Android.
      var shortChunks = [];
      chunks.forEach(function (part) {
        if (part.length <= 110) {
          shortChunks.push(part);
          return;
        }
        var words = part.split(/\s+/);
        var buf = "";
        words.forEach(function (word) {
          var trial = buf ? buf + " " + word : word;
          if (trial.length <= 110) buf = trial;
          else {
            if (buf) shortChunks.push(buf);
            buf = word;
          }
        });
        if (buf) shortChunks.push(buf);
      });
      chunks = shortChunks;
      if (!chunks.length) {
        reject(new Error("empty"));
        return;
      }

      try { window.speechSynthesis.cancel(); } catch (err) {}
      try { window.speechSynthesis.getVoices(); } catch (err2) {}

      var voice = chooseVoice();
      var pitch = voicePitch(voice);
      var pending = chunks.length;
      var started = false;
      var failed = false;

      var finishOk = function () {
        if (failed) return;
        resolve(true);
      };
      var finishErr = function (err) {
        if (failed) return;
        failed = true;
        try { window.speechSynthesis.cancel(); } catch (e0) {}
        reject(err || new Error("native speak failed"));
      };

      // Queue every chunk up front — Android Chrome is much happier than onend chaining.
      chunks.forEach(function (piece, index) {
        var utter = new SpeechSynthesisUtterance(piece);
        utter.rate = 1.0;
        utter.pitch = pitch;
        utter.volume = 1;
        if (voice) utter.voice = voice;
        utter.lang = (voice && voice.lang) || "en-US";
        utter.onstart = function () { started = true; };
        utter.onend = function () {
          pending -= 1;
          if (token !== speakToken) {
            finishErr(new Error("cancelled"));
            return;
          }
          if (pending <= 0) finishOk();
        };
        utter.onerror = function (event) {
          var code = event && event.error;
          if (code === "interrupted" || code === "canceled") {
            finishErr(new Error(code));
            return;
          }
          pending -= 1;
          if (pending <= 0) {
            if (started) finishOk();
            else finishErr(new Error(code || "utterance error"));
          }
        };
        try {
          window.speechSynthesis.speak(utter);
        } catch (err3) {
          finishErr(err3);
        }
      });
    });
  }

  function speakWithSam(plain, token) {
    return new Promise(function (resolve, reject) {
      var sam = getSam();
      if (!sam) {
        reject(new Error("no sam"));
        return;
      }
      var chunks = samChunks(plain);
      if (!chunks.length) {
        reject(new Error("no chunks"));
        return;
      }

      var playIndex = function (index) {
        if (token !== speakToken) {
          resolve(false);
          return;
        }
        if (index >= chunks.length) {
          resolve(true);
          return;
        }
        var piece = chunks[index];
        var buf8;
        try {
          buf8 = sam.buf8(piece);
        } catch (err2) {
          reject(err2);
          return;
        }
        if (!buf8 || !buf8.length) {
          playIndex(index + 1);
          return;
        }
        playWavBlob(wavFromBuf8(buf8), token).then(function () {
          playIndex(index + 1);
        }).catch(reject);
      };

      playIndex(0);
    });
  }

  function startSpeech(plain, fromUserGesture) {
    pendingAutoId = -1;
    if (!plain) return;
    if (!fromUserGesture) {
      setSpeechStatus("Tap Hear Cosmo read it to hear the slip aloud.");
      return;
    }

    var token = ++speakToken;
    stopTtsAudio();
    if ("speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch (err) {}
    }
    unlockAudio();

    var hasNative = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
    var hasSam = typeof SamJs === "function";
    if (!hasNative && !hasSam) {
      setSpeechStatus("This browser has no voice engine. Try Chrome.");
      return;
    }

    setSpeechStatus("Cosmo is reading the slip...");
    hearBtn.disabled = true;

    var doneOk = function () {
      if (token !== speakToken) return;
      hearBtn.disabled = false;
      setSpeechStatus("Cosmo finished reading the slip.");
    };
    var doneFail = function (message) {
      if (token !== speakToken) return;
      hearBtn.disabled = false;
      setSpeechStatus(message);
    };

    // Prefer natural phone voices. Skip robotic SAM whenever native TTS exists
    // (SAM sounds like a Stephen Hawking toy — fine only as last resort).
    if (hasNative) {
      try { window.speechSynthesis.getVoices(); } catch (e) {}
      speakWithNative(plain, token).then(function () {
        doneOk();
      }).catch(function () {
        doneFail("Voice cut out. Tap Hear Cosmo read it again.");
      });
      return;
    }

    setSpeechStatus("Cosmo is reading the slip...");
    speakWithSam(plain, token).then(function (ok) {
      if (ok) doneOk();
      else doneFail("Voice stopped early. Tap Hear Cosmo read it again.");
    }).catch(function () {
      doneFail("Phone blocked audio. Unmute media volume, then tap again.");
    });
  }

  function autoSpeak(id) {
    if (id !== pendingAutoId || id !== readingId) return;
    pendingAutoId = -1;
    setSpeechStatus("Tap Hear Cosmo read it to hear the slip aloud.");
  }

  function reveal(reading, id) {
    if (id !== readingId) return;
    slipBody.innerHTML = slipHtml(reading.model);
    slip.setAttribute("aria-label", "Reading for " + reading.model.name);
    currentPlain = reading.plain;
    consultStatus.hidden = true;
    scene.classList.remove("is-consulting");
    actions.hidden = false;
    hearBtn.disabled = !(typeof SamJs === "function" || ("speechSynthesis" in window));
    slipWrap.classList.add("is-open");
    pendingAutoId = id;
    if (!reduceMotion) {
      slip.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    setSpeechStatus("Tap “Hear Cosmo read it” to hear the slip aloud.");
  }

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
    if (!currentPlain) {
      setSpeechStatus("Consult the orb first, then tap again.");
      return;
    }
    startSpeech(currentPlain, true);
  });

  function digitsOnly(value, maxLen) {
    return String(value || "").replace(/\D+/g, "").slice(0, maxLen);
  }

  function composedBirthday() {
    var mm = digitsOnly(birthdayMonth.value, 2);
    var dd = digitsOnly(birthdayDay.value, 2);
    var yyyy = digitsOnly(birthdayYear.value, 4);
    if (mm.length < 1 || dd.length < 1 || yyyy.length < 4) return "";
    return parseBirthday(mm + "/" + dd + "/" + yyyy);
  }

  function syncSignFromBirthday() {
    var sign = signFromIso(composedBirthday());
    if (sign) signInput.value = sign;
  }

  function wireBdayField(input, maxLen, next) {
    input.addEventListener("input", function () {
      var cleaned = digitsOnly(input.value, maxLen);
      if (cleaned !== input.value) input.value = cleaned;
      syncSignFromBirthday();
      if (cleaned.length >= maxLen && next) next.focus();
    });
    input.addEventListener("change", syncSignFromBirthday);
  }

  wireBdayField(birthdayMonth, 2, birthdayDay);
  wireBdayField(birthdayDay, 2, birthdayYear);
  wireBdayField(birthdayYear, 4, null);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    copyStatus.textContent = "";
    if (!bank) {
      formError.textContent = "The fortune ledger has not loaded yet.";
      return;
    }
    var name = nameInput.value.trim().replace(/\s+/g, " ");
    var birthday = composedBirthday();
    var sign = signInput.value;
    var errors = [];
    if (!name) errors.push("Enter your name.");
    if (!digitsOnly(birthdayMonth.value, 2) || !digitsOnly(birthdayDay.value, 2) || digitsOnly(birthdayYear.value, 4).length < 4) {
      errors.push("Enter birthday as MM / DD / YYYY.");
    } else if (!birthday) {
      errors.push("That birthday is not a real date.");
    } else if (!signFromIso(birthday)) {
      errors.push("That birthday could not be read.");
    } else if (birthday > todayIso()) {
      errors.push("Birthday has to be today or earlier.");
    }
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
    unlockAudio();
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
