const Canvas = require('canvas')

function generate(message) {
    try {
        var srcImgData1 = message.srcImgData1;
        var width = message.width;
        var height = message.height;
        var durationSeconds = message.durationSeconds;
        var maxSpecFreq = message.maxSpecFreq;
        var Factor = message.Factor || 2;

        var tmpData = [];
        var maxFreq = 0;
        var data2 = [];
        var sampleRate = 44100;
        var channels = 1;
        var numSamples = Math.round(sampleRate * durationSeconds);
        var samplesPerPixel = Math.floor(numSamples / width);
        var C = maxSpecFreq / height;
        var yFactor = parseFloat(Factor);

        for (var x = 0; x < numSamples; x++) {
            var rez = 0;
            var pixel_x = Math.floor(x / samplesPerPixel);

            for (var y = 0; y < height; y += yFactor) {
                var pixel_index = (y * width + pixel_x) * 4;
                var r = srcImgData1.data[pixel_index];
                var g = srcImgData1.data[pixel_index + 1];
                var b = srcImgData1.data[pixel_index + 2];

                var s = r + b + g;
                var volume = Math.pow(s * 100 / 765, 2);

                var freq = Math.round(C * (height - y + 1));
                rez += Math.floor(volume * Math.cos(freq * 6.28 * x / sampleRate));
            }

            tmpData.push(rez);

            if (Math.abs(rez) > maxFreq) {
                maxFreq = Math.abs(rez);
            }
        }

        for (var i = 0; i < tmpData.length; i++) {
            data2.push(32767 * tmpData[i] / maxFreq);
        }

        var sampleBits = 16;
        var numChannels = 1;

        var dataLength = data2.length * (sampleBits / 8);
        var buffer = new ArrayBuffer(44 + dataLength);
        var data = new DataView(buffer);
        var offset = 0;

        var writeString = function (str) {
            for (var i = 0; i < str.length; i++) {
                data.setUint8(offset + i, str.charCodeAt(i));
            }
        }

        writeString('RIFF'); offset += 4;
        data.setUint32(offset, 36 + dataLength, true); offset += 4;
        writeString('WAVE'); offset += 4;
        writeString('fmt '); offset += 4;
        data.setUint32(offset, 16, true); offset += 4;
        data.setUint16(offset, 1, true); offset += 2;
        data.setUint16(offset, numChannels, true); offset += 2;
        data.setUint32(offset, sampleRate, true); offset += 4;
        data.setUint32(offset, numChannels * sampleRate * (sampleBits / 8), true); offset += 4;
        data.setUint16(offset, numChannels * (sampleBits / 8), true); offset += 2;
        data.setUint16(offset, sampleBits, true); offset += 2;
        writeString('data'); offset += 4;
        data.setUint32(offset, dataLength, true); offset += 4;

        if (sampleBits === 8) {
            for (var i = 0; i < data2.length; i++, offset++) {
                var s = Math.max(-1, Math.min(1, data2[i]));
                var val = s < 0 ? s * 0x8000 : s * 0x7FFF;
                val = parseInt(255 / (65535 / (val + 32768)));
                data.setInt8(offset, val, true);
            }
        } else {
            for (var i = 0; i < data2.length; i++) {
                data.setInt8(offset, data2[i] & 0xFF, true);
                offset += 1;
                data.setInt8(offset, (data2[i] >> 8) & 0xFF, true);
                offset += 1;
            }
        }

        return data
    } catch (err) {
        throw err
    }
}

module.exports = async function (src, { o_length = 6, o_freq = 20000, o_factor = 1 } = {}) {
    var srcimg = await Canvas.loadImage(src).catch(() => { });
    if (!srcimg) return ''
    
    var canvas = Canvas.createCanvas(srcimg.width, srcimg.height)
    var context = canvas.getContext("2d");
    context.drawImage(srcimg, 0, 0, srcimg.width, srcimg.height, 0, 0, srcimg.width, srcimg.height);

    var srcImgData1 = context.getImageData(0, 0, canvas.width, canvas.height);
    var width = srcImgData1.width;
    var height = srcImgData1.height;
    var durationSeconds = parseFloat(o_length);
    var maxSpecFreq = parseInt(o_freq);
    var Factor = o_factor;

    var data = generate({
        'srcImgData1': srcImgData1,
        'width': width,
        'height': height,
        'durationSeconds': durationSeconds,
        'maxSpecFreq': maxSpecFreq,
        'Factor': Factor
    });

    return data
}