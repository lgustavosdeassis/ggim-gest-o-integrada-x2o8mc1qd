migrate(
  (app) => {
    try {
      const users = app.findCollectionByNameOrId('users')

      try {
        app.findAuthRecordByEmail('users', 'admin@ggim.foz.br')
        return // already seeded
      } catch (_) {
        // expected if user does not exist
      }

      const record = new Record(users)
      record.setEmail('admin@ggim.foz.br')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Administrador')
      record.set('role', 'admin')
      app.save(record)
    } catch (_) {
      // catch all to prevent 'sql: no rows in result set' from crashing migrations
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'admin@ggim.foz.br')
      app.delete(record)
    } catch (_) {}
  },
)
