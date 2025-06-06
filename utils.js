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
