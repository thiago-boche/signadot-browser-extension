module.exports = {
  "roots": [
    "src",
    "tests"
  ],
  "transform": {
    "^.+\\.ts$": ["ts-jest", {tsconfig: "tsconfig.test.json"}]
  },
}; 
