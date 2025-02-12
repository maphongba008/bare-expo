const { Inspector } = require('pear-inspect')

module.exports = class KeetInspector {
  constructor() {
    this._key = null
    this._inspector = null
  }

  get key() {
    return this._key
  }

  async enable() {
    if (this._key) return this._key

    this._inspector = new Inspector()

    const key = await this._inspector.enable()
    this._key = key.toString('hex')

    return this._key
  }

  async disable() {
    await this._inspector?.disable()
    this._inspector = null
    this._key = null
  }
}
