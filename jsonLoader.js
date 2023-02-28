

 function jsonLoader(source) {
  return `export default ${JSON.stringify(source)}`
}

module.exports = jsonLoader