var { createClassNames } = require("./classnames");

var cn = createClassNames();

cn.createClassNames = createClassNames;
cn.classNames = cn;
cn.default = cn;
cn.cn = cn;

module.exports = cn;
