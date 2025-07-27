const Canvas = require('canvas');

module.exports = async function (src) {
	var img = await Canvas.loadImage(src).catch(() => { });
	if (!img) return { r: 0, g: 0, b: 0 }
	var canvas = Canvas.createCanvas(1, 1);
	var ctx = canvas.getContext('2d');
	var width = canvas.width = img.naturalWidth;
	var height = canvas.height = img.naturalHeight;

	ctx.drawImage(img, 0, 0);

	var imageData = ctx.getImageData(0, 0, width, height);
	var data = imageData.data;
	var r = 0;
	var g = 0;
	var b = 0;

	for (var i = 0, l = data.length; i < l; i += 4) {
		r += data[i];
		g += data[i + 1];
		b += data[i + 2];
	}

	r = Math.floor(r / (data.length / 4));
	g = Math.floor(g / (data.length / 4));
	b = Math.floor(b / (data.length / 4));

	return { r: r, g: g, b: b };
}