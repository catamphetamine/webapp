// If you don't want to use a wrapper like jDataView, you can wrap Node.js'
// Buffer with the mandatory parts from the DataView interface.

export default function DataView(_data) {
	this._data = _data;
	this.byteLength = this._data.length;
}

DataView.prototype.getUint8 = function (offset) {
	return this._data.readUInt8(offset);
}

DataView.prototype.getUint16 = function (offset, littleEndian) {
	if ((littleEndian !== null) && littleEndian) {
		return this._data.readUInt16LE(offset);
	}
	return this._data.readUInt16BE(offset);
}

DataView.prototype.getUint32 = function (offset, littleEndian) {
	if ((littleEndian !== null) && littleEndian) {
		return this._data.readUInt32LE(offset);
	}
	return this._data.readUInt32BE(offset);
}

DataView.prototype.getInt32 = function (offset, littleEndian) {
	if ((littleEndian !== null) && littleEndian) {
		return this._data.readInt32LE(offset);
	}
	return this._data.readInt32BE(offset);
}