function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function convertAngle(value, to) {
    if (to === "deg") {
        return value * (180 / Math.PI);
    } else if (to === "rad") {
        return value * (Math.PI / 180);
    } else {
        throw new Error("Invalid target unit. Use 'deg' or 'rad'.");
    }
}



function containsAnyPattern(str, patterns) {
    return patterns.some(pattern => str.includes(pattern));
}

function getValue(deltaTime) {
    const base = 0.7;
    const referenceDelta = 1 / 60;
    const k = 0.24; // tweak this to fine-tune
    return base * Math.pow(referenceDelta / deltaTime, k);
}
