// ///////////////
// helper functions
// ///////////////
let det4x4 = function (data) {
	let out = 0;
	for (let i = 0; i < 4; i++) {
		let toDet3x3 = [];
		for (let row = 1; row < 4; row++) {
			for (let column = 0; column < 4; column++) {
				if (column !== i)
					toDet3x3.push(data[row * 4 + column]);
			}
		}

		// console.log(i, toDet3x3, det3x3(toDet3x3));

		out += (i % 2 ? -1 : 1) * data[i] * det3x3(toDet3x3);
	}

	return out;
};
let det3x3 = function (data) {
	let out = 0;
	for (let i = 0; i < 3; i++) {
		let toDet2x2 = [];
		for (let row = 1; row < 3; row++) {
			for (let column = 0; column < 3; column++) {
				if (column !== i)
					toDet2x2.push(data[row * 3 + column]);
			}
		}

		// console.log(i, toDet2x2, det2x2(toDet2x2));

		out += (i % 2 ? -1 : 1) * data[i] * det2x2(toDet2x2);
	}

	return out;
};
let det2x2 = function (data) {
	return (data[0] * data[3]) - (data[1] * data[2]);
};

module.exports = {
	det4x4: det4x4,
	det3x3: det3x3,
	det2x2: det2x2
};
