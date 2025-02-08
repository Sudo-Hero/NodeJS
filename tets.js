const helperPromise = function () {
    const promise = new Promise(function (resolve, reject) {
        const x = "geeksforgeeks";
        const y = "geeksforgeeks";
        if (x === y) {
            resolve("Strings are same");
        } else {
            reject("Strings are not same");
        }
    });

    return promise;
};

async function demoPromise() {
    try {
        let message = await helperPromise();
        console.log(message);
    } catch (error) {
        console.log("Error: " + error);
    }
    console.log("asdasd")
}

demoPromise();