import { db } from 'src/firebase'

export class serverUtils {
  // Use firebase serverTimeOffset to get the date from the server and not the client.
  // https://firebase.google.com/docs/database/web/offline-capabilities#clock-skew
  static async getServerTime() {
    let time_ms = 0
    await db
      .ref('/.info/serverTimeOffset')
      .once('value')
      .then(
        function stv(data) {
          time_ms = data.val() + Date.now()
        },
        (err) => {
          return err
        }
      )

    const server_time = new Date(time_ms)

    return server_time
  }
}
