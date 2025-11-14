const preferSetHTML = require("./prefer-sethtml-over-innerhtml");
const disallowDocWrite = require("./disallow-document-write-ln");
const plugin = {
    rules: {
        "preferSetHTML": preferSetHTML,
        "disallowDocWrite": disallowDocWrite,
    }
}
module.exports = plugin;