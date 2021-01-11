class Input {
  /** @type {string} */
  filename;
  /** @type {string} */
  name;
  /** @type {string} */
  type;
  /** @type {Buffer} */
  data;
}

class Part {
  /** @type {string} */
  header;
  /** @type {string} */
  infos;
  /** @type {number[]} */
  part;
}

/**
 * @param {Part} part
 * @returns Input
 */
function process({ header, infos, part }) {
  /**
   * @param {string} str
   */
  const obj = (str) => {
    const k = str.split("=");
    const a = k[0].trim();
    const b = JSON.parse(k[1].trim());
    const o = {};
    const props = { writable: true, enumerable: true, configurable: true };
    Object.defineProperty(o, a, { value: b, ...props });
    return o;
  };
  const filename = header.split(";")[2];
  /** @type {Input} */
  let input = {};
  const props = { writable: true, enumerable: true, configurable: true };
  if (filename && infos) {
    input = obj(filename);
    const type = infos.split(":")[1].trim();
    Object.defineProperty(input, "type", { value: type, ...props });
  } else {
    const name = header.split(";")[1].split("=")[1].replace(/"/g, "");
    Object.defineProperty(input, "name", { value: name, ...props });
  }
  const data = Buffer.from(part);
  return Object.defineProperty(input, "data", { value: data, ...props });
}

/**
 * @param {Buffer} buffer Binaires
 * @param {string} boundary Frontière
 * @returns Input[]
 */
function parser(buffer, boundary) {
  let lastline = "";
  let header = "";
  let info = "";
  let state = 0;
  /** @type {number[]} */
  let _buffer = [];
  /** @type {Input[]} */
  const parts = [];

  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    const prev = i > 0 ? buffer[i - 1] : null;
    const newline = {
      detected: byte === 0x0a && prev === 0x0d ? true : false,
      char: byte === 0x0a || byte === 0x0d ? true : false,
    };
    if (!newline.char) lastline += String.fromCharCode(byte);
    switch (true) {
      case state === 0 && newline.detected:
        if (`--${boundary}` === lastline) state = 1;
        lastline = "";
        break;

      case state === 1 && newline.detected:
        header = lastline;
        state = 2;
        if (header.indexOf("filename") === 1) state = 3;
        lastline = "";
        break;

      case state === 2 && newline.detected:
        infos = lastline;
        state = 3;
        lastline = "";
        break;

      case state === 3 && newline.detected:
        state = 4;
        _buffer = [];
        lastline = "";
        break;

      case state === 4:
        if (lastline.length > boundary.length + 4) lastline = "";
        if (`--${boundary}` === lastline) {
          const part = _buffer.slice(0, _buffer.length - lastline.length - 1);
          parts.push(process({ header, infos, part }));
          _buffer = [];
          lastline = "";
          state = 5;
          header = "";
          info = "";
        } else {
          _buffer.push(byte);
        }
        if (newline.detected) lastline = "";
        break;

      case state === 5:
        if (newline.detected) state = 1;
        break;
    }
  }
  return parts;
}

/**
 * lit le boundary du header content-type
 * @param {string} header
 * @returns string
 */
function getBoundary(header) {
  const items = header.split(";");
  if (items) {
    for (let i = 0; i < items.length; i++) {
      const item = new String(items[i]).trim();
      if (item.indexOf("boundary") >= 0) {
        const k = item.split("=");
        return new String(k[1]).trim();
      }
    }
  }
  return "";
}

module.exports = {
  parser,
  process,
  getBoundary,
};
