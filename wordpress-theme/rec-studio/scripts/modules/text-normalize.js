const WINDOWS_1252_BYTES = new Map([
    [0x20ac, 0x80],
    [0x201a, 0x82],
    [0x0192, 0x83],
    [0x201e, 0x84],
    [0x2026, 0x85],
    [0x2020, 0x86],
    [0x2021, 0x87],
    [0x02c6, 0x88],
    [0x2030, 0x89],
    [0x0160, 0x8a],
    [0x2039, 0x8b],
    [0x0152, 0x8c],
    [0x017d, 0x8e],
    [0x2018, 0x91],
    [0x2019, 0x92],
    [0x201c, 0x93],
    [0x201d, 0x94],
    [0x2022, 0x95],
    [0x2013, 0x96],
    [0x2014, 0x97],
    [0x02dc, 0x98],
    [0x2122, 0x99],
    [0x0161, 0x9a],
    [0x203a, 0x9b],
    [0x0153, 0x9c],
    [0x017e, 0x9e],
    [0x0178, 0x9f]
]);

const decoder = new TextDecoder("utf-8");
const MOJIBAKE_RE = /[ÐÑÂâ][\u0080-\uffff]?/;
const BAD_RE = /[ÐÑÂâ][\u0080-\uffff]?|�/g;
const CYRILLIC_RE = /[А-Яа-яЁё]/g;
const TEXT_ATTRS = ["alt", "aria-label", "title", "data-help-title", "data-text"];

function countMatches(value, pattern) {
    return (value.match(pattern) || []).length;
}

function encodeMojibakeBytes(value) {
    const bytes = [];

    for (const char of value) {
        const code = char.codePointAt(0);

        if (code <= 0xff) {
            bytes.push(code);
            continue;
        }

        const byte = WINDOWS_1252_BYTES.get(code);

        if (byte === undefined) {
            return null;
        }

        bytes.push(byte);
    }

    return bytes;
}

export function decodeMojibake(value) {
    if (!value || !MOJIBAKE_RE.test(value)) return value;

    const bytes = encodeMojibakeBytes(value);
    if (!bytes) return value;

    const decoded = decoder.decode(new Uint8Array(bytes));

    const originalBad = countMatches(value, BAD_RE);
    const decodedBad = countMatches(decoded, BAD_RE);
    const originalCyrillic = countMatches(value, CYRILLIC_RE);
    const decodedCyrillic = countMatches(decoded, CYRILLIC_RE);

    if (
        decodedBad < originalBad &&
        (decodedCyrillic > originalCyrillic || originalBad > 1)
    ) {
        return decoded;
    }

    return value;
}

export function normalizeMojibake(root = document.body) {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parent = node.parentElement;

            if (!parent) return NodeFilter.FILTER_REJECT;
            if (/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/i.test(parent.tagName)) {
                return NodeFilter.FILTER_REJECT;
            }

            return MOJIBAKE_RE.test(node.nodeValue || "")
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_REJECT;
        }
    });

    const textNodes = [];

    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => {
        node.nodeValue = decodeMojibake(node.nodeValue);
    });

    root.querySelectorAll?.("*").forEach((element) => {
        TEXT_ATTRS.forEach((attr) => {
            if (!element.hasAttribute(attr)) return;

            element.setAttribute(attr, decodeMojibake(element.getAttribute(attr)));
        });
    });
}
