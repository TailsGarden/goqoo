require('isomorphic-fetch')
const { Dropbox } = require('dropbox')
const path = require('path')

const sleep = milliSec => new Promise(resolve => setTimeout(resolve, milliSec))
module.exports = class DropboxKintone {
  constructor ({ accessToken, localRootDir }) {
    this.dbx = new Dropbox({ accessToken })
    this.localRootDir = localRootDir
  }

  async fetchSharedLink (filePath) {
    try {
      const { url } = await this.dbx.sharingCreateSharedLink({ path: filePath })
      return {
        localPath: path.join(this.localRootDir, filePath),
        dropboxUrl: url.replace('dl=0', 'raw=1'),
      }
    } catch (e) {
      if (e.error && e.error.error_summary && e.error.error_summary.includes('path/not_found')) {
        console.error(`${filePath}: Not synced yet. Retrying...`)
        await sleep(1000)
        return this.fetchSharedLink(filePath)
      }
      console.error(e)
      Promise.reject(e)
    }
  }

  async fetchSharedLinks (filePaths) {
    const promises = []
    for (const filePath of filePaths) {
      promises.push(this.fetchSharedLink(filePath))
    }
    return Promise.all(promises)
  }
}
