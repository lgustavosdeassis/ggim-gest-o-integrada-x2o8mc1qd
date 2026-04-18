migrate(
  (app) => {
    let users
    try {
      users = app.findCollectionByNameOrId('users')
    } catch (_) {
      return // collection not found, skip
    }

    try {
      app.findAuthRecordByEmail('users', 'admin@ggim.foz.br')
      return // already seeded
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('admin@ggim.foz.br')
    // Seed uses a password that complies with PocketBase's 8 character minimum limit
    record.setPassword('admin1234')
    record.setVerified(true)
    record.set('name', 'Administrador')
    record.set('role', 'admin')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'admin@ggim.foz.br')
      app.delete(record)
    } catch (_) {}
  },
)
