"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _path = _interopRequireDefault(require("path"));

var _loadBmfont = _interopRequireDefault(require("load-bmfont"));

var _utils = require("@jimp/utils");

var _measureText = require("./measure-text");

var splitGraphemes = require("../splitgraphemes");
var getEmojis = require("../emojis");

function xOffsetBasedOnAlignment(constants, font, line, maxWidth, alignment) {
  if (alignment === constants.HORIZONTAL_ALIGN_LEFT) {
    return 0;
  }

  if (alignment === constants.HORIZONTAL_ALIGN_CENTER) {
    return (maxWidth - (0, _measureText.measureText)(font, line)) / 2;
  }

  return maxWidth - (0, _measureText.measureText)(font, line);
}

async function drawCharacter(image, font, x, y, _char, grapheme) {
  if (_char.width > 0 && _char.height > 0) {
    if (_char.id === 'image') {
      var Jimp = require('jimp')
      var urlmatch = grapheme.match(/(http|https):\/\/[^ "<>]+/)
      var url = urlmatch[0]
      var emoji = await Jimp.read(url).catch(() => { });

      if (emoji) {
        var squareS = { value: ((emoji.bitmap.height === emoji.bitmap.width) && emoji.bitmap.width) || ((emoji.bitmap.height > emoji.bitmap.width) && emoji.bitmap.height) || emoji.bitmap.width, constraint: ((emoji.bitmap.height === emoji.bitmap.width) && 'both') || ((emoji.bitmap.height > emoji.bitmap.width) && 'height') || 'width' }
        emoji.resize(squareS.constraint === 'width' || squareS.constraint === 'both' ? font.common.lineHeight : Jimp.AUTO, squareS.constraint === 'height' || squareS.constraint === 'both' ? font.common.lineHeight : Jimp.AUTO)

        image.blit(emoji, x + font.common.lineHeight / 2 - emoji.bitmap.width / 2 + _char.xoffset, y + font.common.lineHeight / 2 - emoji.bitmap.height / 2 + _char.yoffset);
      }
    } else if (_char.id === 'discord') {
      var Jimp = require('jimp')
      var emojiidmatch = grapheme.match(/[0-9]+/g)
      var emojiid = emojiidmatch[emojiidmatch.length - 1]
      var emoji = await Jimp.read(`https://cdn.discordapp.com/emojis/${emojiid}.png?size=1024`).catch(() => { });

      if (emoji) {
        var squareS = { value: ((emoji.bitmap.height === emoji.bitmap.width) && emoji.bitmap.width) || ((emoji.bitmap.height > emoji.bitmap.width) && emoji.bitmap.height) || emoji.bitmap.width, constraint: ((emoji.bitmap.height === emoji.bitmap.width) && 'both') || ((emoji.bitmap.height > emoji.bitmap.width) && 'height') || 'width' }
        emoji.resize(squareS.constraint === 'width' || squareS.constraint === 'both' ? font.common.lineHeight : Jimp.AUTO, squareS.constraint === 'height' || squareS.constraint === 'both' ? font.common.lineHeight : Jimp.AUTO)

        image.blit(emoji, x + font.common.lineHeight / 2 - emoji.bitmap.width / 2 + _char.xoffset, y + font.common.lineHeight / 2 - emoji.bitmap.height / 2 + _char.yoffset);
      }
    } else if (_char.id === 'emoji') {
      var Jimp = require('jimp')
      var emoji = await Jimp.read(_char.url).catch(() => { });

      if (emoji) {
        emoji.resize(font.common.lineHeight, font.common.lineHeight)

        image.blit(emoji, x + _char.xoffset, y + _char.yoffset);
      }
    } else {
      var characterPage = font.pages[_char.page];
      image.blit(characterPage, x + _char.xoffset, y + _char.yoffset, _char.x, _char.y, _char.width, _char.height);
    }
  }

  return image;
}

async function printText(font, x, y, text, defaultCharWidth) {
  var chars = splitGraphemes(text)

  for (var i = 0; i < chars.length; i++) {
    var _char2 = void 0;
    var char = chars[i]
    var nextchar = chars[i + 1]

    if (char.type === 'discord' || char.type === 'image') {
      _char2 = char.type;
    } else if (font.chars[char.grapheme]) {
      _char2 = char.grapheme;
    } else if (/\s/.test(char.grapheme)) {
      _char2 = '';
    } else {
      _char2 = '?';
    }

    var fontChar = font.chars[_char2] || {};
    var fontKerning = font.kernings[_char2];
    await drawCharacter(this, font, x, y, fontChar || {}, char.grapheme);
    var kerning = fontKerning && fontKerning[nextchar && nextchar.grapheme] ? fontKerning[nextchar && nextchar.grapheme] : 0;
    x += kerning + (fontChar.xadvance || defaultCharWidth);
  }
}

function splitLines(font, text, maxWidth) {
  var words = text.split(' ');
  var lines = [];
  var currentLine = [];
  var longestLine = 0;
  words.forEach(function (word) {
    var line = [].concat((0, _toConsumableArray2["default"])(currentLine), [word]).join(' ');
    var length = (0, _measureText.measureText)(font, line);

    if (length <= maxWidth) {
      if (length > longestLine) {
        longestLine = length;
      }

      currentLine.push(word);
    } else {
      lines.push(currentLine);
      currentLine = [word];
    }
  });
  lines.push(currentLine);
  return {
    lines: lines,
    longestLine: longestLine
  };
}

function loadPages(Jimp, dir, pages) {
  var newPages = pages.map(function (page) {
    return Jimp.read(dir + '/' + page);
  });
  return Promise.all(newPages);
}

var dir = process.env.DIRNAME || "".concat(__dirname, "/../");

var _default = function _default() {
  return {
    constants: {
      measureText: _measureText.measureText,
      measureTextHeight: _measureText.measureTextHeight,
      FONT_SANS_8_BLACK: _path["default"].join(dir, 'fonts/open-sans/open-sans-8-black/open-sans-8-black.fnt'),
      FONT_SANS_10_BLACK: _path["default"].join(dir, 'fonts/open-sans/open-sans-10-black/open-sans-10-black.fnt'),
      FONT_SANS_12_BLACK: _path["default"].join(dir, 'fonts/open-sans/open-sans-12-black/open-sans-12-black.fnt'),
      FONT_SANS_14_BLACK: _path["default"].join(dir, 'fonts/open-sans/open-sans-14-black/open-sans-14-black.fnt'),
      FONT_SANS_16_BLACK: _path["default"].join(dir, 'fonts/open-sans/open-sans-16-black/open-sans-16-black.fnt'),
      FONT_SANS_32_BLACK: _path["default"].join(dir, 'fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt'),
      FONT_SANS_64_BLACK: _path["default"].join(dir, 'fonts/open-sans/open-sans-64-black/open-sans-64-black.fnt'),
      FONT_SANS_128_BLACK: _path["default"].join(dir, 'fonts/open-sans/open-sans-128-black/open-sans-128-black.fnt'),
      FONT_SANS_8_WHITE: _path["default"].join(dir, 'fonts/open-sans/open-sans-8-white/open-sans-8-white.fnt'),
      FONT_SANS_16_WHITE: _path["default"].join(dir, 'fonts/open-sans/open-sans-16-white/open-sans-16-white.fnt'),
      FONT_SANS_32_WHITE: _path["default"].join(dir, 'fonts/open-sans/open-sans-32-white/open-sans-32-white.fnt'),
      FONT_SANS_64_WHITE: _path["default"].join(dir, 'fonts/open-sans/open-sans-64-white/open-sans-64-white.fnt'),
      FONT_SANS_128_WHITE: _path["default"].join(dir, 'fonts/open-sans/open-sans-128-white/open-sans-128-white.fnt'),

      /**
       * Loads a bitmap font from a file
       * @param {string} file the file path of a .fnt file
       * @param {function(Error, Jimp)} cb (optional) a function to call when the font is loaded
       * @returns {Promise} a promise
       */
      loadFont: function loadFont(file, cb) {
        var _this = this;

        if (typeof file !== 'string') return _utils.throwError.call(this, 'file must be a string', cb);
        return new Promise(function (resolve, reject) {
          cb = cb || function (err, font) {
            if (err) reject(err); else resolve(font);
          };

          (0, _loadBmfont["default"])(file, async function (err, font) {
            var chars = {};
            var kernings = {};

            if (err) {
              return _utils.throwError.call(_this, err, cb);
            }

            for (var i = 0; i < font.chars.length; i++) {
              chars[String.fromCodePoint(font.chars[i].id)] = font.chars[i];
            }

            chars['image'] = {
              id: 'image',
              x: 0,
              y: 0,
              width: font.common.lineHeight,
              height: font.common.lineHeight,
              xoffset: 0,
              yoffset: 0,
              xadvance: font.common.lineHeight,
              chnl: 0
            };

            chars['discord'] = {
              id: 'discord',
              x: 0,
              y: 0,
              width: font.common.lineHeight,
              height: font.common.lineHeight,
              xoffset: 0,
              yoffset: 0,
              xadvance: font.common.lineHeight,
              chnl: 0
            };

            var emojis = await getEmojis().catch(() => { }) ?? []

            for (var i = 0; i < emojis.length; i++) {
              var emoji = emojis[i]
              chars[emoji.emoji] = {
                id: 'emoji',
                x: 0,
                y: 0,
                width: font.common.lineHeight,
                height: font.common.lineHeight,
                xoffset: 0,
                yoffset: 0,
                xadvance: font.common.lineHeight,
                chnl: 0,
                url: emoji.url
              };
            }

            for (var _i = 0; _i < font.kernings.length; _i++) {
              var firstString = String.fromCodePoint(font.kernings[_i].first);
              kernings[firstString] = kernings[firstString] || {};
              kernings[firstString][String.fromCodePoint(font.kernings[_i].second)] = font.kernings[_i].amount;
            }

            loadPages(_this, _path["default"].dirname(file), font.pages).then(function (pages) {
              cb(null, {
                chars: chars,
                kernings: kernings,
                pages: pages,
                common: font.common,
                info: font.info
              });
            });
          });
        });
      }
    },
    "class": {
      /**
       * Draws a text on a image on a given boundary
       * @param {Jimp} font a bitmap font loaded from `Jimp.loadFont` command
       * @param {number} x the x position to start drawing the text
       * @param {number} y the y position to start drawing the text
       * @param {any} text the text to draw (string or object with `text`, `alignmentX`, and/or `alignmentY`)
       * @param {number} maxWidth (optional) the boundary width to draw in
       * @param {number} maxHeight (optional) the boundary height to draw in
       * @param {function(Error, Jimp)} cb (optional) a function to call when the text is written
       * @returns {Jimp} this for chaining of methods
       */
      print: async function print(font, x, y, text, maxWidth, maxHeight, cb) {
        var _this2 = this;

        if (typeof maxWidth === 'function' && typeof cb === 'undefined') {
          cb = maxWidth;
          maxWidth = Infinity;
        }

        if (typeof maxWidth === 'undefined') {
          maxWidth = Infinity;
        }

        if (typeof maxHeight === 'function' && typeof cb === 'undefined') {
          cb = maxHeight;
          maxHeight = Infinity;
        }

        if (typeof maxHeight === 'undefined') {
          maxHeight = Infinity;
        }

        if ((0, _typeof2["default"])(font) !== 'object') {
          return _utils.throwError.call(this, 'font must be a Jimp loadFont', cb);
        }

        if (typeof x !== 'number' || typeof y !== 'number' || typeof maxWidth !== 'number') {
          return _utils.throwError.call(this, 'x, y and maxWidth must be numbers', cb);
        }

        if (typeof maxWidth !== 'number') {
          return _utils.throwError.call(this, 'maxWidth must be a number', cb);
        }

        if (typeof maxHeight !== 'number') {
          return _utils.throwError.call(this, 'maxHeight must be a number', cb);
        }

        var alignmentX;
        var alignmentY;

        if ((0, _typeof2["default"])(text) === 'object' && text.text !== null && text.text !== undefined) {
          alignmentX = text.alignmentX || this.constructor.HORIZONTAL_ALIGN_LEFT;
          alignmentY = text.alignmentY || this.constructor.VERTICAL_ALIGN_TOP;
          var _text = text;
          text = _text.text;
        } else {
          alignmentX = this.constructor.HORIZONTAL_ALIGN_LEFT;
          alignmentY = this.constructor.VERTICAL_ALIGN_TOP;
          text = text.toString();
        }

        if (maxHeight !== Infinity && alignmentY === this.constructor.VERTICAL_ALIGN_BOTTOM) {
          y += maxHeight - (0, _measureText.measureTextHeight)(font, text, maxWidth);
        } else if (maxHeight !== Infinity && alignmentY === this.constructor.VERTICAL_ALIGN_MIDDLE) {
          y += maxHeight / 2 - (0, _measureText.measureTextHeight)(font, text, maxWidth) / 2;
        }

        var defaultCharWidth = Object.entries(font.chars)[0][1].xadvance;
        var breaks = text.split('\n');
        var longestBreak = 0;

        for (var b in breaks) {
          var br = breaks[b]
          var _splitLines = splitLines(font, br, maxWidth),
            lines = _splitLines.lines,
            longestLine = _splitLines.longestLine;

          if (longestLine > longestBreak) longestBreak = longestLine

          for (var i in lines) {
            var line = lines[i]
            var lineString = line.join(' ');
            var alignmentWidth = xOffsetBasedOnAlignment(_this2.constructor, font, lineString, maxWidth, alignmentX);
            await printText.call(_this2, font, x + alignmentWidth, y, lineString, defaultCharWidth);
            y += i != lines.length - 1 ? font.common.lineHeight : 0;
          }

          y += font.common.lineHeight;
        }

        if ((0, _utils.isNodePattern)(cb)) {
          cb.call(this, null, this, {
            x: x + longestBreak,
            y: y
          });
        }

        return this;
      }
    }
  };
};

exports["default"] = _default;
//# sourceMappingURL=index.js.map
